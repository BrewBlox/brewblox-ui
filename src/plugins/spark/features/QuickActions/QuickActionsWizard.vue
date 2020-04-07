<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';
import { sparkType } from '@/plugins/spark/getters';
import { Service, serviceStore } from '@/store/services';

import { QuickActionsConfig } from './types';


@Component
export default class QuickActionsWizard extends WidgetWizardBase<QuickActionsConfig> {
  service: Service | null = null;

  get serviceId(): string {
    return this.service?.id ?? '';
  }

  get serviceOpts(): SelectOption[] {
    return serviceStore.services
      .filter(service => service.type === sparkType)
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  createWidget(): void {
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.featureId,
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
    this.widgetTitle = this.featureTitle;
  }
}
</script>

<template>
  <ActionCardBody>
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

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!service" unelevated label="Create" color="primary" @click="createWidget" />
    </template>
  </ActionCardBody>
</template>
