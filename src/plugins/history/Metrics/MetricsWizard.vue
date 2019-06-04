<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

import { MetricsConfig } from './types';


@Component
export default class MetricsWizard extends WidgetWizardBase {
  modalOpen: boolean = false;
  metricsCfg: MetricsConfig = {
    targets: [],
    renames: {},
    params: {},
    freshDuration: {},
    decimals: {},
  }

  createWidget() {
    this.createItem({
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      order: 0,
      dashboard: this.dashboardId,
      config: this.metricsCfg,
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
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <MetricsForm
        v-if="modalOpen"
        :id="widgetId"
        :type="typeId"
        :field="metricsCfg"
        :title="widget.title"
        :on-change-field="v => metricsCfg = v"
        :on-change-title="v => widgetTitle = v"
      />
    </q-dialog>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetTitle" dark label="Widget name"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <div class="row">
        <q-btn
          unelevated
          label="Configure"
          color="primary"
          class="q-mx-md"
          @click="modalOpen = true"
        />
        <q-btn unelevated label="Create" color="primary" @click="createWidget"/>
      </div>
    </q-card-actions>
  </div>
</template>
