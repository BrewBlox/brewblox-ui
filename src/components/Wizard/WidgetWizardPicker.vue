<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import dashboardStore from '@/store/dashboards';
import featureStore from '@/store/features';

@Component
export default class WidgetWizardPicker extends Vue {
  @Prop({ type: String, required: false })
  readonly dashboardId!: string;

  filteredOptions: any[] = [];
  feature: any = null;
  wizardActive: boolean = false;

  localChosenDashboardId: string = '';

  get chosenDashboardId() {
    return this.localChosenDashboardId
      || this.dashboardId
      || dashboardStore.primaryDashboardId
      || '';
  }

  set chosenDashboardId(id: string) {
    this.localChosenDashboardId = id;
  }

  get dashboardOptions() {
    return dashboardStore.dashboardValues
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  get wizardOptions() {
    return featureStore.featureIds
      .map(id => ({
        label: featureStore.displayNameById(id),
        value: id,
        component: featureStore.wizardById(id),
      }))
      .filter(opt => !!opt.component)
      .sort(objectStringSorter('label'));
  }

  get valuesOk() {
    return !!this.chosenDashboardId && !!this.feature;
  }

  filterFn(val, update) {
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

  setTitle(title: string) {
    this.$emit('title', title);
  }

  reset() {
    this.wizardActive = false;
    this.setTitle('Widget wizard');
    this.filteredOptions = this.wizardOptions;
  }

  back() {
    this.$emit('back');
  }

  close() {
    this.$emit('close');
  }

  next() {
    this.wizardActive = true;
    this.setTitle(`${this.feature.label} wizard`);
  }

  mounted() {
    this.reset();
  }
}
</script>

<template>
  <div>
    <component
      v-if="wizardActive"
      :is="feature.component"
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
              <template v-slot:no-option>
                <q-item dark>
                  <q-item-section class="text-grey">No results</q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
            <q-option-group v-model="chosenDashboardId" :options="dashboardOptions"/>
          </q-item-section>
        </q-item>
      </q-card-section>

      <q-separator dark/>

      <q-card-actions class="row justify-between">
        <q-btn unelevated label="Back" @click="back"/>
        <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="next"/>
      </q-card-actions>
    </template>
  </div>
</template>
