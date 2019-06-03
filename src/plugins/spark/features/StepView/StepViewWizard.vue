<script lang="ts">
import get from 'lodash/get';
import Component from 'vue-class-component';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import serviceStore, { Service } from '@/store/services';


@Component
export default class StepViewWizard extends WidgetWizardBase {
  service: Service | null = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get serviceOpts() {
    return serviceStore.serviceValues
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  createWidget() {
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      config: {
        serviceId: this.serviceId,
        steps: [],
      },
      ...this.defaultWidgetSize,
    });
  }

  mounted() {
    this.widgetTitle = this.typeDisplayName;
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetTitle" dark label="Widget name"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Service</q-item-label>
          <q-option-group v-model="service" :options="serviceOpts"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn :disable="!service" unelevated label="Create" color="primary" @click="createWidget"/>
    </q-card-actions>
  </div>
</template>
