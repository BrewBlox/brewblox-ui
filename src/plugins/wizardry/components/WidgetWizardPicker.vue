<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import WizardBase from '@/plugins/wizardry/WizardBase';
import { featureStore } from '@/store/features';
import { systemStore } from '@/store/system';

@Component
export default class WidgetWizardPicker extends WizardBase {
  feature: any = null;
  wizardActive = false;
  filter = '';

  mounted(): void {
    this.reset();
  }

  get experimental(): boolean {
    return systemStore.experimental;
  }

  get wizardOptions(): SelectOption[] {
    return featureStore.widgets
      .filter(feature => this.experimental || !feature.experimental)
      .map(feature => ({
        label: feature.title,
        value: feature.id,
        component: featureStore.widgetWizard(feature.id),
        badge: feature.experimental ? 'experimental' : null,
      }))
      .filter(opt => opt.component !== null)
      .sort(objectStringSorter('label'));
  }

  get filteredOptions(): SelectOption[] {
    if (!this.filter) {
      return this.wizardOptions;
    }
    const needle = this.filter.toLowerCase();
    return this.wizardOptions
      .filter(opt => opt.label.toLowerCase().match(needle));
  }

  get valuesOk(): boolean {
    return this.feature !== null;
  }

  showSearchKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.filter,
    })
      .onOk((v: string) => this.filter = v);
  }

  reset(): void {
    this.wizardActive = false;
    this.setDialogTitle('Widget wizard');
    this.filter = '';
  }

  next(): void {
    if (!this.valuesOk) { return; }
    this.wizardActive = true;
    this.setDialogTitle(`${this.feature.label} wizard`);
  }
}
</script>

<template>
  <component
    :is="feature.component"
    v-if="wizardActive"
    :feature-id="feature.value"
    :active-dashboard-id="activeDashboardId"
    @title="setDialogTitle"
    @back="reset"
    @close="close"
    @done="done"
  />

  <ActionCardBody v-else @keyup.ctrl.enter="next">
    <div class="widget-body column">
      <q-input
        v-model="filter"
        placeholder="Search"
        clearable
        autofocus
        class="q-mb-md"
      >
        <template #append>
          <KeyboardButton @click="showSearchKeyboard" />
          <q-icon name="search" />
        </template>
      </q-input>
      <ListSelect
        v-model="feature"
        :options="filteredOptions"
        option-value="value"
        option-label="label"
        @confirm="v => { feature = v; next(); }"
      />
    </div>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn
        :disable="!valuesOk"
        unelevated
        label="Next"
        color="primary"
        @click="next"
      />
    </template>
  </ActionCardBody>
</template>
