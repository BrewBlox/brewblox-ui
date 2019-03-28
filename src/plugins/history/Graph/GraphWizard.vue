<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import Component from 'vue-class-component';


@Component
export default class GraphWizard extends WidgetWizardBase {
  modalOpen: boolean = false;
  graphCfg: GraphConfig = {
    layout: {},
    params: {},
    targets: [],
    renames: {},
    axes: {},
  };

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

}
</script>

<template>
  <div>
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <GraphForm
        v-if="modalOpen"
        :id="widgetId"
        :type="typeId"
        :field="graphCfg"
        :on-change-id="changeWidgetId"
        :on-change-field="v => graphCfg = v"
      />
    </q-dialog>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetId" :rules="widgetIdRules" dark label="Widget name"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <div class="row">
        <q-btn
          :disable="!widgetIdOk"
          unelevated
          label="Configure"
          color="primary"
          class="q-mx-md"
          @click="modalOpen = true"
        />
        <q-btn
          :disable="!widgetIdOk"
          unelevated
          label="Create"
          color="primary"
          @click="createWidget"
        />
      </div>
    </q-card-actions>
  </div>
</template>
