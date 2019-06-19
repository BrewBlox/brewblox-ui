<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

import { ProcessViewConfig } from './types';


@Component
export default class ProcessViewWizard extends WidgetWizardBase {
  createWidget() {
    const config: ProcessViewConfig = {
      parts: [],
    };
    this.createItem({
      config,
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      dashboard: this.dashboardId,
      order: 0,
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
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn unelevated label="Create" color="primary" @click="createWidget"/>
    </q-card-actions>
  </div>
</template>
