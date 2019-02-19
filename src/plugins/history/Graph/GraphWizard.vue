<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import FormBase from '@/components/Widget/FormBase';
import WizardBase, { NavAction } from '@/components/Widget/WizardBase';
import { formById } from '@/store/features/getters';
import Component from 'vue-class-component';


@Component
export default class GraphWizard extends WizardBase {
  currentStep: string = '';
  widgetId: string = '';
  graphCfg: GraphConfig | null = null;

  get navigation(): { [id: string]: NavAction[] } {
    return {
      start: [
        {
          label: 'Cancel',
          click: () => this.cancel(),
          enabled: () => true,
        },
        {
          label: 'Configure graph',
          click: () => {
            this.graphCfg = this.placeholderConfig();
            this.stepper.goToStep('config');
          },
          enabled: () => !this.widgetIdError,
        },
      ],
      config: [
        {
          label: 'Back',
          click: () => this.stepper.previous(),
          enabled: () => true,
        },
        {
          label: 'Finish',
          click: () => this.createWidget(),
          enabled: () => true,
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

  get form() {
    return formById(this.$store, this.typeId);
  }

  get formComponent() {
    return this.$refs.form as FormBase;
  }

  placeholderConfig(): GraphConfig {
    return {
      layout: {},
      params: {},
      targets: [],
      renames: {},
    };
  }

  createWidget() {
    this.createItem({
      id: this.widgetId,
      feature: this.typeId,
      order: 0,
      dashboard: this.$props.dashboardId,
      config: this.graphCfg,
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
    <!-- configure -->
    <q-step name="config" title="Configure graph">
      <component
        v-if="graphCfg"
        ref="form"
        :is="form"
        :id="widgetId"
        :type="typeId"
        :field="graphCfg"
        :on-change-id="v => widgetId = v"
        :on-change-field="v => graphCfg = v"
        embedded
      />
    </q-step>
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
