<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';
import { PersistentWidget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext } from '@/store/features';


@Component
export default class GenericWidgetWizard extends WidgetWizardBase {
  modalOpen = false;
  localConfig: any | null = null;

  get widget(): PersistentWidget {
    if (this.localConfig === null) {
      this.localConfig = this.emptyConfig();
    }
    return {
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      order: 0,
      dashboard: this.dashboardId,
      config: this.localConfig,
      ...this.defaultWidgetSize,
    };
  }

  set widget(val: PersistentWidget) {
    this.localConfig = val.config;
  }

  get crud(): Crud {
    return {
      isStoreWidget: false,
      widget: this.widget,
      saveWidget: v => this.widget = v,
      closeDialog: () => this.modalOpen = false,
    };
  }

  get context(): WidgetContext {
    return {
      container: 'Dialog',
      mode: 'Full',
    };
  }

  get widgetComponent(): string {
    return featureStore.widget(this.crud);
  }

  emptyConfig(): any {
    const feature = featureStore.features[this.featureId];
    return feature.generateConfig !== undefined
      ? feature.generateConfig()
      : {};
  }

  createWidget(): void {
    this.createItem(this.widget);
  }

  created(): void {
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

    <q-dialog v-model="modalOpen" no-backdrop-dismiss class="row">
      <component
        :is="widgetComponent"
        :initial-crud="crud"
        :context="context"
        @close="modalOpen = false"
      />
    </q-dialog>

    <q-card-actions align="right">
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn unelevated label="Configure" @click="modalOpen = true" />
      <q-btn unelevated label="Create" color="primary" @click="createWidget" />
    </q-card-actions>
  </div>
</template>
