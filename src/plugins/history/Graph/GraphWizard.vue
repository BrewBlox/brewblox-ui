<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { dashboardItemById } from '@/store/dashboards/getters';
import { DashboardItem } from '@/store/dashboards/state';
import {
  widgetSizeById,
  formById,
  displayNameById as featureNameById,
} from '@/store/features/getters';
import { displayNameById } from '@/store/providers/getters';
import { GraphConfig } from '@/components/Graph/state';
import FormBase from '@/components/Widget/FormBase';

interface NavAction {
  label: string;
  click: Function;
  enabled: Function;
}

@Component({
  props: {
    featureId: {
      type: String,
      required: true,
    },
    onCreateItem: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
})
export default class GraphWizard extends Vue {
  currentStep: string = '';
  widgetId: string = '';
  graphCfg: GraphConfig | null = null;

  get navigation(): { [id: string]: NavAction[] } {
    return {
      start: [
        {
          label: 'Cancel',
          click: () => this.$props.onCancel(),
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
          label: 'Revert form',
          click: () => this.formComponent.cancelChanges(),
          enabled: () => true,
        },
        {
          label: 'Finish',
          click: () => {
            this.formComponent.confirmChanges();
            this.createWidget();
          },
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
    if (dashboardItemById(this.$store, this.widgetId)) {
      return 'Name must be unique';
    }
    return null;
  }

  get form() {
    return formById(this.$store, this.$props.featureId);
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
    const item: Partial<DashboardItem> = {
      id: this.widgetId,
      widget: this.$props.featureId,
      config: this.graphCfg,
      ...widgetSizeById(this.$store, this.$props.featureId),
    };
    this.$props.onCreateItem(item);
  }

  mounted() {
    this.widgetId = '';
    this.stepper.reset();
  }
}
</script>

<template>
  <q-stepper
    ref="stepper"
    v-model="currentStep"
  >

    <!-- start -->
    <q-step
      default
      name="start"
      title="Widget info"
    >
      <q-field
        label="Widget name"
        icon="create"
        orientation="vertical"
      >
        <q-input
          v-model="widgetId"
          placeholder="Enter a widget Name"
          :error="widgetIdError !== null"
          :suffix="widgetIdError"
        />
      </q-field>
    </q-step>


    <!-- configure -->
    <q-step
      name="config"
      title="Configure graph"
    >
      <component
        v-if="graphCfg"
        v-model="graphCfg"
        ref="form"
        :is="form"
      />
    </q-step>

    <q-stepper-navigation>
      <q-btn
        flat
        v-for="action in navigation[currentStep]"
        :key="action.label"
        :label="action.label"
        :disabled="!action.enabled()"
        @click="action.click"
      />
    </q-stepper-navigation>

  </q-stepper>
</template>
