<script lang="ts">
import isString from 'lodash/isString';
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { ruleErrorFinder } from '@/helpers/functional';
import { loadFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import WizardBase from '@/plugins/wizardry/WizardBase';
import { dashboardStore, Widget } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { systemStore } from '@/store/system';

const widgetRules: InputRule[] = [
  v => v !== null || 'Widget must have a value',
  v => isString(v.title) || 'Widget must have a title',
  v => isString(v.feature) || 'Widget must have a type',
  v => featureStore.widgetIds.includes(v.feature) || 'Widget type is unknown',
  v => !!v.config || 'Widget must have config settings',
];

const errorFinder = ruleErrorFinder(widgetRules);

@Component
export default class ImportWizard extends WizardBase {
  localChosenDashboardId = '';
  widget: Widget | null = null;

  @Prop({ type: String, default: '' })
  readonly dashboardId!: string;

  get primaryDashboardId(): string | null {
    const { homePage } = systemStore.config;
    if (!homePage || !homePage.startsWith('/dashboard')) {
      return null;
    }
    return homePage.split('/')[2] ?? null;
  }

  get chosenDashboardId(): string {
    return this.localChosenDashboardId
      || this.dashboardId
      || this.primaryDashboardId
      || dashboardStore.dashboardIds[0]
      || '';
  }

  set chosenDashboardId(id: string) {
    this.localChosenDashboardId = id;
  }

  get dashboardOptions(): SelectOption[] {
    return dashboardStore.dashboards
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  get widgetError(): string | null {
    return errorFinder(this.widget);
  }

  get widgetOk(): boolean {
    return this.widgetError === null;
  }

  get widgetString(): string {
    if (this.widget === null) {
      return '';
    }
    if (!this.widgetOk) {
      return '<invalid config>';
    }
    return `[${featureStore.widgetTitle(this.widget.feature)}] ${this.widget.title}`;
  }

  get valuesOk(): boolean {
    return !!this.chosenDashboardId && this.widgetOk;
  }

  async createWidget(): Promise<void> {
    if (this.widget === null) { return; }
    try {
      await dashboardStore.appendWidget({
        ...this.widget,
        id: uid(),
        dashboard: this.chosenDashboardId,
      });
      notify.done(`Created ${featureStore.widgetTitle(this.widget.feature)} <b>${this.widget.title}</b>`);
      this.$emit('close');
    } catch (e) {
      notify.error(`Failed to create widget: ${e.toString()}`);
    }
  }

  mounted(): void {
    this.setDialogTitle('Import wizard');
  }

  startImport(): void {
    loadFile<Widget>(v => this.widget = v);
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <LabeledField v-if="dashboardOptions.length <= 5" label="Dashboard" item-aligned>
        <q-option-group
          v-model="chosenDashboardId"
          :options="dashboardOptions"
          label="test"
        />
      </LabeledField>
      <q-select
        v-else
        v-model="chosenDashboardId"
        :options="dashboardOptions"
        label="Dashboard"
        map-options
        emit-value
        item-aligned
      />
      <q-item>
        <q-item-section>
          <q-input
            label="Loaded widget"
            readonly
            :value="widgetString"
            :error-message="widgetError"
            :error="widget !== null && !widgetOk"
          />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn flat label="Load" @click="startImport" />
        </q-item-section>
      </q-item>
    </q-card-section>

    <template #actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Create" color="primary" @click="createWidget" />
    </template>
  </ActionCardBody>
</template>
