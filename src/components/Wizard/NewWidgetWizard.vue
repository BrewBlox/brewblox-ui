<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';
import { Notify } from 'quasar';

import { allTypes, wizardByType, displayNameByType } from '@/features/feature-by-type';
import { DashboardItem } from '@/store/dashboards/state';
import { dashboardItemById } from '@/store/dashboards/getters';
import { widgetWizards } from './widget-types.ts';

/* eslint-disable indent */
@Component({
  components: {
    ...widgetWizards,
  },
  props: {
    onCreateItem: {
      type: Function,
      default: () => { throw new Error('Provide onCreateItem callback'); },
    },
  },
})
/* eslint-enable */
export default class NewWidgetWizard extends Vue {
  widgetId: string = '';
  searchModel: string = '';
  featureWizard: VueConstructor | null = null;

  get wizardOptions() {
    return allTypes
      .filter(wizardByType)
      .filter(type => displayNameByType(type).match(this.searchModel))
      .map(type => ({
        label: displayNameByType(type),
        value: wizardByType(type),
      }));
  }

  get widgetIdError() {
    if (!this.widgetId) {
      return 'ID must not be empty';
    }
    if (dashboardItemById(this.$store, this.widgetId)) {
      return 'ID must be unique';
    }
    return null;
  }

  get featureWizardActive() {
    return this.featureWizard !== null;
  }

  get wizardComponent() {
    return this.featureWizard;
  }

  set wizardComponent(component: VueConstructor | null) {
    this.featureWizard = component;
  }

  selectFeature(wizard: VueConstructor) {
    if (this.widgetIdError !== null) {
      Notify.create(this.widgetIdError);
      return;
    }
    this.wizardComponent = wizard;
  }

  onCreate(partial: Partial<DashboardItem>) {
    this.$props.onCreateItem({
      ...partial,
      id: this.widgetId,
    });
    this.reset();
  }

  reset() {
    this.widgetId = '';
    this.searchModel = '';
    this.wizardComponent = null;
  }

  mounted() {
    this.reset();
  }
}
</script>

<template>
  <div class="layout-padding">

    <q-item v-if="featureWizardActive">
      <component
        v-if="featureWizardActive"
        :is="featureWizard"
        :onCreateItem="onCreate"
        :onCancel="reset"
      />
    </q-item>
    <!-- Select a wizard -->
    <q-item v-else>
      <q-field
        label="Widget ID"
        icon="create"
        orientation="vertical"
      >
        <q-input
          v-model="widgetId"
          placeholder="Enter a widget ID"
          :error="widgetIdError !== null"
          :suffix="widgetIdError"
        />
      </q-field>

      <q-field
        label="Select a widget type"
        icon="widgets"
        orientation="vertical"
      >
        <q-item>
          <q-search
            v-model="searchModel"
            placeholder="Search"
          />
        </q-item>
        <q-list link inset-separator>
          <q-item
            icon="widgets"
            v-for="opt in wizardOptions"
            :key="opt.label"
            @click.native="selectFeature(opt.value)"
          >
            <div class="row">
              <q-item-main>
                <q-item-tile label>{{ opt.label }}</q-item-tile>
              </q-item-main>
              <q-item-side right icon="chevron_right" />
            </div>
          </q-item>
        </q-list>
      </q-field>
    </q-item>

  </div>
</template>

<style>
.q-item {
  display: grid;
  grid-gap: 10px;
}

.q-list {
  border: 0;
}

.q-option-group {
  border: 0;
}

.layout-padding {
  position: relative;
}
</style>
