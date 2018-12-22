<script lang="ts">
import Component from 'vue-class-component';
import WizardBase from '@/components/Widget/WizardBase';

interface NavAction {
  label: string;
  click: Function;
  enabled: Function;
}

@Component
export default class ExampleFeatureWizard extends WizardBase {
  widgetId: string = '';

  get navigation(): NavAction[] {
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
    if (!this.widgetId) {
      return 'Name must not be empty';
    }
    if (this.itemAlreadyExists(this.widgetId)) {
      return 'Name must be unique';
    }
    return null;
  }

  createWidget() {
    this.createItem({
      id: this.widgetId,
      feature: this.typeId,
      config: {
        lastUrl: '/datastore',
      },
      ...this.defaultWidgetSize,
    });
  }

  mounted() {
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
          placeholder="Enter a widget Name"
          :error="widgetIdError !== null"
          :suffix="widgetIdError"
        />
      </q-field>
    </q-step>
    <!-- nav -->
    <q-stepper-navigation>
      <q-btn
        flat
        v-for="action in navigation"
        :key="action.label"
        :label="action.label"
        :disabled="!action.enabled()"
        @click="action.click"
      />
    </q-stepper-navigation>
  </q-stepper>
</template>
