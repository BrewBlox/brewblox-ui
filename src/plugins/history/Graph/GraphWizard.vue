<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import FormBase from '@/components/Widget/FormBase';
import { dashboardItemById } from '@/store/dashboards/getters';
import { DashboardItem } from '@/store/dashboards/state';
import {
  formById,
  widgetSizeById,
} from '@/store/features/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

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
      feature: this.$props.featureId,
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
  <q-stepper ref="stepper" v-model="currentStep">
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
    <!-- configure -->
    <q-step name="config" title="Configure graph">
      <component
        :is="form"
        ref="form"
        v-if="graphCfg"
        :field="graphCfg"
        :change="v => graphCfg = v"
        :buttons="false"
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
