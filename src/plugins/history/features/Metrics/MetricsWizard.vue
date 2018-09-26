<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { dashboardItemById } from '@/store/dashboards/getters';
import { serviceValues } from '@/store/services/getters';
import { Service } from '@/store/services/state';
import { DashboardItem } from '@/store/dashboards/state';
import {
  widgetSizeById,
  formById,
  displayNameById as featureNameById,
} from '@/store/features/getters';
import { displayNameById } from '@/store/providers/getters';

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
export default class MetricsWizard extends Vue {
  currentStep: string = '';
  widgetId: string = '';
  service: Service | null = null;

  get navigation(): { [id: string]: NavAction[] } {
    return {
      start: [
        {
          label: 'Cancel',
          click: () => this.$props.onCancel(),
          enabled: () => true,
        },
        {
          label: 'Finish',
          click: () => this.createWidget(),
          enabled: () => !this.widgetIdError && this.service !== null,
        },
      ],
    };
  }

  get stepper(): any {
    return this.$refs.stepper;
  }

  get serviceOpts() {
    return serviceValues(this.$store)
      .filter(service => service.type === 'History')
      .map(service => ({
        label: service.title,
        value: service,
      }));
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

  createWidget() {
    const service = this.service as Service;
    const item: DashboardItem = {
      id: this.widgetId,
      widget: this.$props.featureId,
      config: {
        name: featureNameById(this.$store, this.$props.featureId),
        serviceId: service.id,
        metrics: [],
      },
      ...widgetSizeById(this.$store, this.$props.featureId),
    };
    this.$props.onCreateItem(item);
  }

  mounted() {
    this.widgetId = '';
    this.service = null;
    this.stepper.reset();
  }
}
</script>

<template>
  <q-stepper
    ref="stepper"
    v-model="currentStep"
  >
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

      <q-field
        label="Service"
        icon="create"
        orientation="vertical"
      >
        <q-option-group
          dark
          type="radio"
          v-model="service"
          :options="serviceOpts"
          @input="() => { block = null; }"
        />
      </q-field>

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
