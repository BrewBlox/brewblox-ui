<script lang="ts">
import get from 'lodash/get';
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';
import { Service, serviceStore } from '@/store/services';

import { QuickActionsConfig } from './types';


@Component
export default class QuickActionsWizard extends WidgetWizardBase<QuickActionsConfig> {
  service: Service | null = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get serviceOpts(): SelectOption[] {
    return serviceStore.serviceValues
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  createWidget(): void {
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      dashboard: this.dashboardId,
      order: 0,
      config: {
        serviceId: this.serviceId,
        steps: [],
        changeIdMigrated: true,
      },
      ...this.defaultWidgetSize,
    });
  }

  mounted(): void {
    this.widgetTitle = this.typeDisplayName;
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item>
        <q-item-section>
          <q-input v-model="widgetTitle" label="Widget name" />
        </q-item-section>
      </q-item>
      <LabeledField label="Service" item-aligned>
        <q-option-group v-model="service" :options="serviceOpts" />
      </LabeledField>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!service" unelevated label="Create" color="primary" @click="createWidget" />
    </q-card-actions>
  </div>
</template>
