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

  filteredOptions: any[] = [];
  feature: any = null;
  wizardActive = false;

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
    return featureStore.featureIds
      .map(id => ({
        label: featureStore.displayName(id),
        value: id,
        component: featureStore.wizard(id),
      }))
      .filter(opt => opt.component !== null)
      .sort(objectStringSorter('label'));
  }

  get valuesOk(): boolean {
    return !!this.chosenDashboardId && !!this.feature;
  }

  filterFn(val, update): void {
    if (val === '') {
      update(() => this.filteredOptions = this.wizardOptions);
      return;
    }

    update(() => {
      const needle = val.toLowerCase();
      this.filteredOptions = this.wizardOptions
        .filter(opt => opt.label.toLowerCase().match(needle));
    });
  }

  setTitle(title: string): void {
    this.$emit('title', title);
  }

  reset(): void {
    this.wizardActive = false;
    this.setTitle('Widget wizard');
    this.filteredOptions = this.wizardOptions;
  }

  back(): void {
    this.$emit('back');
  }

  close(): void {
    this.$emit('close');
  }

  next(): void {
    this.wizardActive = true;
    this.setTitle(`${this.feature.label} wizard`);
  }

  mounted(): void {
    this.reset();
  }
}
</script>

<template>
  <div>
    <component
      :is="feature.component"
      v-if="wizardActive"
      :feature-id="feature.value"
      :dashboard-id="chosenDashboardId"
      @title="setTitle"
      @back="reset"
      @close="close"
    />

    <template v-else>
      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-select
              v-model="feature"
              :options="filteredOptions"
              :rules="[v => !!v || 'You must select a widget type']"
              dark
              use-input
              options-dark
              label="Widget Type"
              @filter="filterFn"
            >
              <template #no-option>
                <q-item dark>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
            <q-option-group v-model="chosenDashboardId" :options="dashboardOptions" dark />
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark />

      <q-card-actions class="row justify-between">
        <q-btn unelevated label="Back" @click="back" />
        <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="next" />
      </q-card-actions>
    </template>
  </div>
</template>
