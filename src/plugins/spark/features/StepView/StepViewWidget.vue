<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/units/parseObject';
import { deserialize, isSubSet, serialize } from '@/helpers/units/parseObject';
import { sparkStore } from '@/plugins/spark/store';
import { Block, ChangeField } from '@/plugins/spark/types';

import { BlockChange, Step } from './types';

interface ChangeDiff {
  key: string;
  oldV: string;
  newV: string;
  changed: boolean;
}

interface StepDiff {
  id: string;
  diff: ChangeDiff[];
}

@Component
export default class StepViewWidget extends WidgetBase {
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

  get applicableSteps(): Record<string, boolean> {
    const blockIds = sparkStore.blockIds(this.serviceId);
    return this.steps
      .reduce(
        (acc, step) => ({
          ...acc,
          [step.id]: step.changes.every(change => blockIds.includes(change.blockId)),
        }),
        {});
  }

  get activeSteps(): Record<string, boolean> {
    return this.steps
      .reduce(
        (acc, step) => ({
          ...acc,
          [step.id]: this.applicableSteps[step.id]
            && step.changes.every(change =>
              isSubSet(change.data, sparkStore.blockById(this.serviceId, change.blockId).data)),
        }),
        {});
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

  showDialog(openStep: string | null): void {
    this.showDialog({
      getProps: () => ({ openStep }),
    });
  }

  changeDiff(change: BlockChange): ChangeDiff[] {
    const block = sparkStore.blockById(this.serviceId, change.blockId);
    const spec = sparkStore.specs[block.type];
    return Object.entries(change.data)
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
  }

  stepDiff(step: Step): StepDiff[] {
    return step.changes.map(change => {
      return { id: change.blockId, diff: this.changeDiff(change) };
    });
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="showDialog(null)">
          <q-list dark bordered>
            <ExportAction :crud="crud" />
            <WidgetActions :crud="crud" />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section>
      <q-item v-for="step in steps" :key="step.id" dark>
        <q-item-section>
          {{ step.name }}
          <q-item-label caption>
            {{ step.changes.length }} Blocks changed
          </q-item-label>
          <q-tooltip v-if="applicableSteps[step.id]">
            <q-list dark dense>
              <q-item v-for="cdiff in stepDiff(step)" :key="`cdiff-${cdiff.id}`" dark>
                <q-item-section class="col-3">
                  {{ cdiff.id }}
                </q-item-section>
                <q-item-section>
                  <ul>
                    <li v-for="item in cdiff.diff" :key="`diff-item-${item.key}`">
                      {{ item.key }}:
                      <template v-if="item.changed">
                        <span style="color: red">{{ item.oldV }}</span>
                        =>
                        <span style="color: lime">{{ item.newV }}</span>
                      </template>
                      <template v-else>
                        {{ item.newV }}
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
          <q-btn flat round icon="settings" @click="showDialog(step.id)" />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :disable="!applicableSteps[step.id]"
            :loading="applying"
            :color="activeSteps[step.id] ? 'positive': ''"
            :label="activeSteps[step.id] ? 'active': 'apply'"
            outline
            @click="applyStep(step)"
          >
            <q-tooltip v-if="activeSteps[step.id]">
              Step is applied
            </q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
