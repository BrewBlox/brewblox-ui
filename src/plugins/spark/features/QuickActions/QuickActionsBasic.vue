<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/Widget/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/units/parseObject';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import { sparkStore } from '@/plugins/spark/store';
import { Block, ChangeField } from '@/plugins/spark/types';

import { BlockChange, Step } from './types';

interface FieldDiff {
  key: string;
  oldV: string;
  newV: string;
  changed: boolean;
}

interface BlockDiff {
  blockId: string;
  diffs: FieldDiff[];
}

interface StepDisplay extends Step {
  applicable: boolean;
  active: boolean;
  diffs: BlockDiff[];
}

@Component
export default class QuickActionsBasic extends CrudComponent {
  applying = false;

  get serviceId(): string {
    return this.widget.config.serviceId;
  }

  get steps(): Step[] {
    return deserialize(this.widget.config.steps);
  }

  set steps(steps: Step[]) {
    this.saveConfig({
      ...this.widget.config,
      steps: serialize(steps),
    });
  }

  get applicableSteps(): Mapped<boolean> {
    const blockIds = sparkStore.blockIds(this.serviceId);
    return this.steps
      .reduce(
        (acc, step) => {
          acc[step.id] = step.changes.every(change => blockIds.includes(change.blockId));
          return acc;
        },
        {});
  }

  get stepDisplays(): StepDisplay[] {
    const blockIds = sparkStore.blockIds(this.serviceId);
    return this.steps
      .map(step => {
        const applicable = step.changes.every(change => blockIds.includes(change.blockId));
        const diffs = applicable ? step.changes.map(this.blockDiff) : [];
        const active = applicable && diffs.every(bdiff => bdiff.diffs.every(fdiff => !fdiff.changed));
        return {
          ...step,
          applicable,
          diffs,
          active,
        };
      });
  }

  confirmStepChange(block: Block, key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const change = sparkStore.specs[block.type].changes
        .find(change => change.key === key) as ChangeField;
      if (!change) {
        resolve(value);
      }
      const pretty = change.pretty || (v => `${v}`);
      createDialog({
        component: 'ChangeConfirmDialog',
        title: 'Confirm change',
        message: `
        Please confirm the ${change.title} value in ${block.id}.
        Current value is '${pretty(block.data[key])}'.
        `,
        serviceId: block.serviceId,
        blockId: block.id,
        value,
        fieldComponent: change.component,
        componentProps: change.componentProps,
      })
        .onOk((updated) => resolve(updated))
        .onCancel(() => reject());
    });
  }

  async applyChanges(step: Step): Promise<void> {
    const changes = step.changes;
    const actualChanges: [Block, any][] = [];
    for (const change of changes) {
      const block = sparkStore.blockById(this.serviceId, change.blockId);
      const actualData = deepCopy(change.data);
      for (const key in change.data) {
        if (change.confirmed && change.confirmed[key]) {
          actualData[key] = await this.confirmStepChange(block, key, actualData[key]);
        }
      }
      actualChanges.push([block, actualData]);
    }
    for (const [block, actualData] of actualChanges) {
      await sparkStore.saveBlock([this.serviceId, { ...block, data: { ...block.data, ...actualData } }]);
    }
    step.changes = step.changes.map((change, idx) => ({ ...change, data: actualChanges[idx][1] }));
    this.steps = this.steps.map(s => s.id === step.id ? step : s);
  }

  applyStep(step: Step): void {
    this.applying = true;
    this.applyChanges(step)
      .then(() => this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Applied ${step.name}`,
      }))
      .catch((e) => {
        if (e) {
          this.$q.notify({
            icon: 'warning',
            color: 'negative',
            message: `Failed to apply ${step.name}: ${e.message}`,
          });
        }
      })
      .finally(() => { this.applying = false; });
  }

  showStepDialog(step: Step): void {
    this.showDialog({
      widgetProps: { openStep: step.id },
    });
  }

  blockDiff(change: BlockChange): BlockDiff {
    const block = sparkStore.blockById(this.serviceId, change.blockId);
    const spec = sparkStore.specs[block.type];
    const diffs =
      Object.entries(change.data)
        .map(([key, val]) => {
          const specChange: any = spec.changes.find(s => s.key === key) || {};
          const pretty = specChange.pretty || (v => `${v}`);
          const oldV = pretty(block.data[key]);
          const newV = pretty(val);
          return {
            key: specChange.title || key,
            oldV,
            newV,
            changed: oldV !== newV,
          };
        });

    return { blockId: change.blockId, diffs };
  }
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item v-for="step in stepDisplays" :key="step.id" dark>
        <q-item-section>
          {{ step.name }}
          <q-item-label caption>
            {{ step.changes.length }} Blocks changed
          </q-item-label>
          <q-tooltip v-if="step.applicable">
            <q-list dark dense>
              <q-item v-for="bdiff in step.diffs" :key="`bdiff-${step.id}-${bdiff.blockId}`" dark>
                <q-item-section class="col-3">
                  {{ bdiff.blockId }}
                </q-item-section>
                <q-item-section>
                  <ul>
                    <li v-for="fdiff in bdiff.diffs" :key="`fdiff-${step.id}-${bdiff.blockId}-${fdiff.key}`">
                      {{ fdiff.key }}:
                      <template v-if="fdiff.changed">
                        <span style="color: red">{{ fdiff.oldV }}</span>
                        =>
                        <span style="color: lime">{{ fdiff.newV }}</span>
                      </template>
                      <template v-else>
                        {{ fdiff.newV }}
                      </template>
                    </li>
                  </ul>
                </q-item-section>
              </q-item>
            </q-list>
          </q-tooltip>
          <q-tooltip v-else>
            Step is not applicable. Do all changed blocks exist?
          </q-tooltip>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="settings" @click="showStepDialog(step)" />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :disable="!step.applicable"
            :loading="applying"
            :color="step.active ? 'positive': ''"
            :label="step.active ? 'active': 'apply'"
            outline
            @click="applyStep(step)"
          >
            <q-tooltip v-if="step.active">
              Step is applied
            </q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
