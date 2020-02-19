<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';

@Component
export default class WidgetWizardPicker extends Vue {
  @Prop({ type: String, required: false })
  readonly dashboardId!: string;

  feature: any = null;
  wizardActive = false;
  filter = '';

  localChosenDashboardId = '';

  get currentDashboard(): string | null {
    return this.$route.path.startsWith('/dashboard')
      ? this.$route.params.id
      : null;
  }

  get chosenDashboardId(): string {
    return this.localChosenDashboardId
      || this.dashboardId
      || this.currentDashboard
      || dashboardStore.primaryDashboardId
      || '';
  }

  set chosenDashboardId(id: string) {
    this.localChosenDashboardId = id;
  }

  get dashboardOptions(): SelectOption[] {
    return dashboardStore.dashboardValues
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  get wizardOptions(): SelectOption[] {
    return featureStore.widgetValues
      .map(feature => ({
        label: feature.title,
        value: feature.id,
        component: featureStore.widgetWizard(feature.id),
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
    return !!this.chosenDashboardId && !!this.feature;
  }

  setTitle(title: string): void {
    this.$emit('title', title);
  }

  reset(): void {
    this.wizardActive = false;
    this.setTitle('Widget wizard');
    this.filter = '';
  }

  back(): void {
    this.$emit('back');
  }

  close(): void {
    this.$emit('close');
  }

  next(): void {
    if (!this.valuesOk) { return; }
    this.wizardActive = true;
    this.setTitle(`${this.feature.label} wizard`);
  }

  mounted(): void {
    this.reset();
  }
}
</script>

<template>
  <component
    :is="feature.component"
    v-if="wizardActive"
    :feature-id="feature.value"
    :dashboard-id="chosenDashboardId"
    @title="setTitle"
    @back="reset"
    @close="close"
  />

  <ActionCardBody v-else>
    <div class="widget-body column">
      <q-select
        v-model="chosenDashboardId"
        :options="dashboardOptions"
        label="Dashboard"
        map-options
        emit-value
      />
      <q-input
        v-model="filter"
        placeholder="Search"
        clearable
        autofocus
      >
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
      <div
        v-for="opt in filteredOptions"
        :key="opt.value"
        :class="[
          'col clickable q-pa-sm rounded-borders',
          {'text-primary': feature === opt}
        ]"
        @click="feature !== opt ? feature = opt : next()"
      >
        {{ opt.label }}
      </div>
    </div>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="next" />
    </template>
  </ActionCardBody>
</template>
