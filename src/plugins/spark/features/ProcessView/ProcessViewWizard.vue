<script lang="ts">
import WidgetWizardBase, { NavAction } from '@/components/Wizard/WidgetWizardBase';
import Component from 'vue-class-component';
import { dashboardValues } from '@/store/dashboards/getters';


@Component
export default class ProcessViewWizard extends WidgetWizardBase {
  currentStep: string = '';
  widgetId: string = '';
  chosenDashboardId: string | null = null;

  get navigation(): { [id: string]: NavAction[] } {
    return {
      start: [
        {
          label: 'Cancel',
          click: () => this.cancel(),
          enabled: () => true,
        },
        {
          label: 'Finish',
          click: () => this.createWidget(),
          enabled: () => !this.widgetIdError && this.chosenDashboardId,
        },
      ],
    };
  }

  get stepper(): any {
    return this.$refs.stepper;
  }

  get widgetIdError() {
    if (!this.widgetId) {
      return 'Name must not be empty';
    }
    if (this.itemAlreadyExists(this.widgetId)) {
      return 'Name must be unique';
    }
    return null;
  }

  get dashboardOpts() {
    return dashboardValues(this.$store)
      .map(dash => ({
        label: dash.title,
        value: dash.id,
      }));
  }

  createWidget() {
    this.createItem({
      id: this.widgetId,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      config: {
        parts: [],
      },
      ...this.defaultWidgetSize,
    });
  }

  mounted() {
    this.widgetId = '';
    this.chosenDashboardId = this.$props.dashboardId || null;
    this.stepper.reset();
  }
}
</script>

<template>
  <q-stepper ref="stepper" v-model="currentStep">
    <!-- start -->
    <q-step default name="start" title="Widget info">
      <q-field label="Widget name" icon="create" orientation="vertical">
        <q-input
          v-model="widgetId"
          :error="widgetIdError !== null"
          :suffix="widgetIdError"
          placeholder="Enter a widget Name"
        />
      </q-field>
      <q-field label="Dashboard" icon="create" orientation="vertical">
        <q-option-group v-model="chosenDashboardId" :options="dashboardOpts" dark type="radio"/>
      </q-field>
    </q-step>
    <!-- nav -->
    <q-stepper-navigation>
      <q-btn
        v-for="action in navigation[currentStep]"
        :key="action.label"
        :label="action.label"
        :disabled="!action.enabled()"
        flat
        @click="action.click"
      />
    </q-stepper-navigation>
  </q-stepper>
</template>
