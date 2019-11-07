<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

import { emptyGraphConfig } from '../getters';
import { GraphConfig } from '../types';


@Component
export default class GraphWizard extends WidgetWizardBase<GraphConfig> {

  createWidget(): void {
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      order: 0,
      dashboard: this.dashboardId,
      config: emptyGraphConfig(),
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
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetTitle" dark label="Widget name" />
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back" />
      <q-btn unelevated label="Create" color="primary" @click="createWidget" />
    </q-card-actions>
  </div>
</template>
