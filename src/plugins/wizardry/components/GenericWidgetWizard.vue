<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { tryCreateWidget } from '@/plugins/wizardry';
import WidgetWizardBase from '@/plugins/wizardry/WidgetWizardBase';
import { Widget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext } from '@/store/features';


@Component
export default class GenericWidgetWizard extends WidgetWizardBase {
  localConfig: any | null = null;
  dashboardId: string | null = null;

  @Prop({ type: String, required: false })
  readonly activeDashboardId!: string;

  created(): void {
    this.widgetTitle = this.featureTitle;
  }

  get widget(): Widget {
    if (this.localConfig === null) {
      this.localConfig = this.emptyConfig();
    }
    return {
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.featureId,
      order: 0,
      dashboard: this.dashboardId ?? '',
      config: this.localConfig,
      ...this.defaultWidgetSize,
    };
  }

  set widget(val: Widget) {
    this.localConfig = val.config;
  }

  get crud(): Crud {
    return {
      isStoreWidget: false,
      widget: this.widget,
      saveWidget: v => this.widget = v,
      closeDialog: () => { },
    };
  }

  get context(): WidgetContext {
    return {
      container: 'Dialog',
      mode: 'Full',
      size: 'Fixed',
    };
  }

  get widgetComponent(): string {
    return featureStore.widgetComponent(this.crud).component;
  }

  get canCreate(): boolean {
    return !!this.dashboardId;
  }

  emptyConfig(): any {
    return featureStore
      .widgetById(this.featureId)
      ?.generateConfig?.()
      ?? {};
  }

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.widgetTitle,
    })
      .onOk(v => this.widgetTitle = v);
  }

  showWidget(): void {
    createDialog({
      component: 'WidgetDialog',
      getCrud: () => this.crud,
    });
  }

  async createWidget(): Promise<void> {
    if (this.canCreate) {
      const widget = await tryCreateWidget(this.widget);
      this.done({ widget });
    }
  }
}
</script>

<template>
  <ActionCardBody>
    <div class="widget-body column">
      <DashboardSelect
        v-model="dashboardId"
        :default-value="activeDashboardId"
      />

      <q-input
        v-model="widgetTitle"
        label="Widget name"
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
    </div>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn
        unelevated
        label="Configure"
        @click="showWidget"
      />
      <q-btn
        :disable="!canCreate"
        unelevated
        label="Create"
        color="primary"
        @click="createWidget"
      />
    </template>
  </ActionCardBody>
</template>
