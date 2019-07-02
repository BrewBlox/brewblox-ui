<script lang="ts">
import { Dialog } from 'quasar';
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import sparkStore from '@/plugins/spark/store';

import { deepCopy } from '../../../../helpers/shadow-copy';
import { Block, ChangeField } from '../../types';
import { BlockChange, Step } from './types';


@Component
export default class StepViewWidget extends WidgetBase {
  modalOpen: boolean = false;
  openStep: string | null = null;
  applying: boolean = false;

  get serviceId() {
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

  confirmStepChange(block: Block, key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const change = sparkStore.specs[block.type].changes
        .find(change => change.key === key) as ChangeField;
      if (!change) {
        resolve(value);
      }
      Dialog.create({
        component: 'ChangeConfirmDialog',
        title: 'Confirm change',
        message: `Please confirm the ${change.title} value in ${block.id}.`,
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

  async applyChanges(changes: BlockChange[]) {
    for (let change of changes) {
      const block = sparkStore.blockById(this.serviceId, change.blockId);
      const actualData = deepCopy(change.data);
      for (let key in change.data) {
        if (change.confirmed && change.confirmed[key]) {
          actualData[key] = await this.confirmStepChange(block, key, actualData[key]);
        }
      }
      await sparkStore.saveBlock([this.serviceId, { ...block, data: { ...block.data, ...actualData } }]);
    }
  }

  applyStep(step: Step) {
    this.applying = true;
    this.applyChanges(step.changes)
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

  openModal(stepId: string | null) {
    this.openStep = stepId;
    this.modalOpen = true;
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <StepViewForm v-if="modalOpen" :crud="crud" :open-step="openStep" />
    </q-dialog>

    <WidgetToolbar :title="widget.title" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="openModal(null)">
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
          <q-item-label caption>{{ step.changes.length }} Blocks changed</q-item-label>
          <q-tooltip>{{ step.changes.map(change => change.blockId).join(', ') }}</q-tooltip>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat round icon="settings" @click="openModal(step.id)" />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :disable="!applicableSteps[step.id]"
            :loading="applying"
            outline
            label="apply"
            @click="applyStep(step)"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
