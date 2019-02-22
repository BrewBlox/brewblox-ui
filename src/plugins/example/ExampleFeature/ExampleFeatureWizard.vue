<script lang="ts">
import Component from 'vue-class-component';
import WidgetWizardBase, { NavAction } from '@/components/Wizard/WidgetWizardBase';

/*
We inherit from WidgetWizardBase, which defines the properties provided to any wizard.
WidgetWizardBase inherits from Vue, and defines some generic getters and functions.
*/
@Component
export default class ExampleFeatureWizard extends WidgetWizardBase {
  widgetId: string = '';

  get navigation(): NavAction[] {
    // Describe the navigation actions at the bottom of the wizard, and when they are enabled
    // More complex wizards can define different actions for each step.
    return [
      {
        label: 'Cancel',
        click: () => this.cancel(),
        enabled: () => true,
      },
      {
        label: 'Finish',
        click: () => this.createWidget(),
        enabled: () => !this.widgetIdError,
      },
    ];
  }

  get widgetIdError() {
    // The finish button is only enabled if widgetIdError is null.
    // We check here whether the user entered valid information.
    if (!this.widgetId) {
      return 'Name must not be empty';
    }
    // this.itemAlreadyExists() is inherited from WidgetWizardBase
    if (this.itemAlreadyExists(this.widgetId)) {
      return 'Name must be unique';
    }
    return null;
  }

  createWidget() {
    // this.createItem() is inherited from WidgetWizardBase.
    this.createItem({
      id: this.widgetId,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      config: {
        lastUrl: '/datastore',
      },
      ...this.defaultWidgetSize,
    });
  }

  created() {
    // created() is a standard Vue lifecycle function (https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)
    // It will be called after the properties are injected, but before the HTML is rendered.
    this.widgetId = '';
  }
}
</script>

<template>
  <q-stepper>
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
    </q-step>
    <!-- nav -->
    <q-stepper-navigation>
      <q-btn
        v-for="action in navigation"
        :key="action.label"
        :label="action.label"
        :disabled="!action.enabled()"
        flat
        @click="action.click"
      />
    </q-stepper-navigation>
  </q-stepper>
</template>
