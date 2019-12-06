<script lang="ts">
import isString from 'lodash/isString';
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { showImportDialog } from '@/helpers/dialog';
import { ruleChecker } from '@/helpers/functional';
import { dashboardStore, PersistentWidget } from '@/store/dashboards';
import { featureStore } from '@/store/features';

const widgetRules: InputRule[] = [
  v => v !== null || 'Widget must have a value',
  v => isString(v.title) || 'Widget must have a title',
  v => isString(v.feature) || 'Widget must have a type',
  v => featureStore.featureIds.includes(v.feature) || 'Widget type is unknown',
  v => !!v.config || 'Widget must have config settings',
];

const checker = ruleChecker(widgetRules);

@Component
export default class ImportWizard extends Vue {
  localChosenDashboardId = '';
  widget: PersistentWidget | null = null;

  @Prop({ type: String, default: '' })
  readonly dashboardId!: string;

  get chosenDashboardId(): string {
    return this.localChosenDashboardId
      || this.dashboardId
      || dashboardStore.primaryDashboardId
      || '';
  }

  set chosenDashboardId(id: string) {
    this.localChosenDashboardId = id;
  }

  get dashboardOptions(): SelectOption[] {
    return dashboardStore.dashboardValues
      .map(dash => ({ label: dash.title, value: dash.id }));
  }

  get widgetError(): string | null {
    return checker(this.widget);
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
    const typeName = featureStore.displayName(this.widget.feature) ?? 'Unknown';
    return `[${typeName}] ${this.widget.title}`;
  }

  get valuesOk(): boolean {
    return !!this.chosenDashboardId && this.widgetOk;
  }

  async createWidget(): Promise<void> {
    if (this.widget === null) { return; }
    try {
      await dashboardStore.appendPersistentWidget({
        ...this.widget,
        id: uid(),
        dashboard: this.chosenDashboardId,
      });
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Created ${featureStore.displayName(this.widget.feature)} '${this.widget.title}'`,
      });
      this.$emit('close');
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to create widget: ${e.toString()}`,
      });
    }
  }

  back(): void {
    this.$emit('back');
  }

  mounted(): void {
    this.$emit('title', 'Import wizard');
  }

  startImport(): void {
    showImportDialog<PersistentWidget>(v => this.widget = v);
  }
}
</script>

<template>
  <div>
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

    <q-separator />

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back" />
      <q-btn :disable="!valuesOk" unelevated label="Create" color="primary" @click="createWidget" />
    </q-card-actions>
  </div>
</template>
