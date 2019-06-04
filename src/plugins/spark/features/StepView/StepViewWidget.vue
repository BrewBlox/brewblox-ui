<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/Widget/WidgetBase';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import sparkStore from '@/plugins/spark/store';

import { Step } from './types';


@Component
export default class StepViewWidget extends WidgetBase {
  modalOpen: boolean = false;
  openStep: string = '';

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

  async applyStep(step: Step) {
    for (let change of step.changes) {
      const block = sparkStore.blockById(this.serviceId, change.blockId);
      await sparkStore.saveBlock([this.serviceId, { ...block, data: { ...block.data, ...change.data } }]);
    }
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Applied ${step.name}`,
    });
  }

  openModal(stepId: string = '') {
    this.openStep = stepId;
    this.modalOpen = true;
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <StepViewForm
        v-if="modalOpen"
        v-bind="$props"
        :open-step="openStep"
        :on-change-field="saveConfig"
      />
    </q-dialog>

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="openModal">
          <q-list dark bordered>
            <ActionItem icon="file_copy" label="Copy widget" @click="onCopy"/>
            <ActionItem icon="exit_to_app" label="Move widget" @click="onMove"/>
            <ActionItem icon="delete" label="Delete widget" @click="onDelete"/>
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
          <q-btn flat round icon="settings" @click="openModal(step.id)"/>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :disable="!applicableSteps[step.id]"
            outline
            label="apply"
            @click="applyStep(step)"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
