<script lang="ts">
import { objectStringSorter } from '@/helpers/functional';
import {
  displayNameById,
  featureIds,
  wizardById,
} from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { dashboardValues, primaryDashboardId } from '@/store/dashboards/getters';

@Component({
  props: {
    dashboardId: {
      type: String,
      required: false,
    },
  },
})
export default class WidgetWizardPicker extends Vue {
  featureId: string = '';
  searchModel: string = '';

  _chosenDashboardId: string = '';

  get chosenDashboardId() {
    return this._chosenDashboardId
      || this.$props.dashboardId
      || primaryDashboardId(this.$store);
  }

  set chosenDashboardId(id: string) {
    this._chosenDashboardId = id;
  }

  get dashboardOptions() {
    return dashboardValues(this.$store)
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  get wizardOptions() {
    return featureIds(this.$store)
      .map(id => ({
        label: displayNameById(this.$store, id),
        value: id,
      }))
      .filter(opt =>
        wizardById(this.$store, opt.value)
        && opt.label.toLowerCase().match(this.searchModel.toLowerCase()))
      .sort(objectStringSorter('label'));
  }

  get wizardComponent() {
    return wizardById(this.$store, this.featureId);
  }

  close() {
    this.$emit('close');
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>Create new widget</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>

    <!-- display wizard -->
    <component
      v-if="wizardComponent"
      :is="wizardComponent"
      :feature-id="featureId"
      :dashboard-id="dashboardId"
      @close="close"
    />

    <!-- Select a wizard -->
    <q-card v-else dark>
      <q-card-main>
        <q-list no-border>
          <q-item>
            <q-select
              v-model="chosenDashboardId"
              :options="dashboardOptions"
              float-label="Dashboard"
            />
          </q-item>
          <q-item>
            <q-search v-model="searchModel" placeholder="Search"/>
          </q-item>
        </q-list>
        <q-list link inset-separator no-border>
          <q-item
            v-for="opt in wizardOptions"
            :key="opt.label"
            icon="widgets"
            @click.native="featureId = opt.value"
          >
            <q-item-main>
              <q-item-tile label>{{ opt.label }}</q-item-tile>
            </q-item-main>
            <q-item-side right icon="chevron_right"/>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card>
  </div>
</template>
