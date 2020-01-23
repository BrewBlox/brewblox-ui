<script lang="ts">
import { Component } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';
import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';
import notify from '@/helpers/notify';
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

  saveSteps(steps: Step[] = this.steps): void {
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
      const spec = sparkStore.specs[block.type];
      const actualData = deepCopy(change.data);
      for (const key in change.data) {
        if (!spec.changes.some(c => c.key === key)) {
          delete actualData[key];
        }
        if (change.confirmed?.[key]) {
          actualData[key] = await this.confirmStepChange(block, key, actualData[key]);
        }
      }
      actualChanges.push([block, actualData]);
    }
    for (const [block, actualData] of actualChanges) {
      await sparkStore.saveBlock([this.serviceId, { ...block, data: { ...block.data, ...actualData } }]);
    }
    step.changes = step.changes.map((change, idx) => ({ ...change, data: actualChanges[idx][1] }));
    this.saveSteps(spliceById(this.steps, step));
  }

  applyStep(step: Step): void {
    this.applying = true;
    this.applyChanges(step)
      .then(() => notify.done(`Applied ${step.name}`))
      .catch(e => notify.warn(`Failed to apply ${step.name}: ${e.message}`))
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
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body column">
      <div
        v-for="step in stepDisplays"
        :key="step.id"
        class="row"
      >
        <div
          class="col-grow q-py-xs q-px-sm rounded-borders clickable"
          style="min-width: 100px"
          @click="showStepDialog(step)"
        >
          <div :class="step.active ? 'text-positive': ''">
            {{ step.name }}
          </div>
          <q-item-label caption class="darkened">
            {{ step.changes.length }} Blocks changed
          </q-item-label>
          <q-tooltip v-if="step.applicable">
            <div class="column">
              <div class="col-auto text-italic" style="font-size: 120%">
                {{ step.active ? 'Step is active' : 'Step changes' }}
              </div>
              <div
                v-for="bdiff in step.diffs"
                :key="`bdiff-${step.id}-${bdiff.blockId}`"
                class="row q-gutter-x-sm items-baseline"
              >
                <div class="col-3 text-italic">
                  {{ bdiff.blockId }}
                </div>
                <div class="col column q-py-sm">
                  <div
                    v-for="fdiff in bdiff.diffs"
                    :key="`fdiff-${step.id}-${bdiff.blockId}-${fdiff.key}`"
                    class="q-gutter-x-xs"
                  >
                    <span>{{ fdiff.key }}:</span>
                    <template v-if="fdiff.changed">
                      <span class="text-negative">{{ fdiff.oldV }}</span>
                      <span>=></span>
                      <span class="text-positive">{{ fdiff.newV }}</span>
                    </template>
                    <span v-else>
                      {{ fdiff.newV }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </q-tooltip>
          <q-tooltip v-else>
            Step is not applicable. Do all changed blocks exist?
          </q-tooltip>
        </div>
        <q-btn
          flat
          round
          :disable="!step.applicable"
          icon="mdi-play-circle"
          :color="step.active ? 'positive' : ''"
          class="col-auto q-ml-sm"
          @click="applyStep(step)"
        >
          <q-tooltip v-if="step.active">
            Step is active
          </q-tooltip>
          <q-tooltip v-else-if="step.applicable">
            Apply step
          </q-tooltip>
        </q-btn>
      </div>
    </div>
  </div>
</template>
