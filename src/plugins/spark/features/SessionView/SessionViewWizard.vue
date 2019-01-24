<script lang="ts">
import WizardBase, { NavAction } from '@/components/Widget/WizardBase';
import Component from 'vue-class-component';


@Component
export default class SessionViewWizard extends WizardBase {
  currentStep: string = '';
  widgetId: string = '';

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
          enabled: () => !this.widgetIdError,
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

  createWidget() {
    this.createItem({
      id: this.widgetId,
      feature: this.$props.featureId,
      config: {
        sessions: [],
      },
      ...this.defaultWidgetSize,
    });
  }

  mounted() {
    this.widgetId = '';
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
