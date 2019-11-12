<script lang="ts">
import get from 'lodash/get';
import { uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { deserialize } from '@/helpers/units/parseObject';
import { dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';

@Component
export default class ImportWizard extends Vue {

  @Prop({ type: String, default: '' })
  readonly dashboardId!: string;

  reader: FileReader = new FileReader();
  serializedWidget = '';

  localChosenDashboardId = '';

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

  get valuesOk(): boolean {
    return !!this.chosenDashboardId && !!this.serializedWidget;
  }

  async createWidget(): Promise<void> {
    try {
      const item = {
        ...deserialize(JSON.parse(this.serializedWidget)),
        id: uid(),
        dashboard: this.chosenDashboardId,
      };
      await dashboardStore.appendPersistentWidget(item);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Created ${featureStore.displayName(item.feature)} '${item.title}'`,
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

  handleFileSelect(evt): void {
    const file = evt.target.files[0];
    if (file) {
      this.reader.readAsText(file);
    } else {
      this.serializedWidget = '';
    }
  }

  mounted(): void {
    this.$emit('title', 'Import wizard');
    this.reader.onload = e => this.serializedWidget = get(e, 'target.result', '');
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label>Dashboard</q-item-label>
          <q-option-group v-model="chosenDashboardId" :options="dashboardOptions" dark />
        </q-item-section>
      </q-item>
      <q-item dark>
        <input type="file" @change="handleFileSelect" />
      </q-item>
    </q-card-section>

    <q-separator dark />

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back" />
      <q-btn :disable="!valuesOk" unelevated label="Create" color="primary" @click="createWidget" />
    </q-card-actions>
  </div>
</template>
