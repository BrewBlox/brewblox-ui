<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { Dashboard, DashboardItem, dashboardStore } from '@/store/dashboards';
import { featureStore, WidgetContext } from '@/store/features';

import { Crud } from '../components/Widget/CrudComponent';
import { startChangeDashboardId, startChangeDashboardTitle, startRemoveDashboard } from '../helpers/dashboards';

interface ValidatedItem {
  id: string;
  component: string;
  crud: Crud;
  error?: string;
}

@Component
export default class DashboardPage extends Vue {
  widgetEditable = false;
  menuModalOpen = false;
  wizardModalOpen = false;

  context: WidgetContext = {
    mode: 'Basic',
    container: 'Dashboard',
  }

  @Watch('dashboardId')
  onChangeDashboardId(): void {
    this.widgetEditable = false;
  }

  @Watch('dashboard')
  onChangeDashboard(newDash, oldDash): void {
    if (oldDash && !newDash) {
      // Dashboard was removed
      this.$router.replace('/');
    }
  }

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard(): Dashboard {
    return dashboardStore.dashboardById(this.dashboardId);
  }

  get allDashboards(): Dashboard[] {
    return dashboardStore.dashboardValues;
  }

  get allItems(): DashboardItem[] {
    return dashboardStore.itemValues;
  }

  get items(): DashboardItem[] {
    return dashboardStore.dashboardItemsByDashboardId(this.dashboardId)
      .sort(objectSorter('order'));
  }

  get validatedItems(): ValidatedItem[] {
    return this.items
      .map((item: DashboardItem) => {
        try {
          if (item.title === undefined) {
            // ensure backwards compatibility
            // older items may not have a title
            item.title = item.id;
          }
          const component = featureStore.widgetById(item.feature, item.config);
          if (!component) {
            throw new Error(`No widget found for ${item.feature}`);
          }
          const validator = featureStore.validatorById(item.feature);
          if (!validator(item.config)) {
            throw new Error(`${item.feature} validation failed`);
          }
          // return { item, component };
          return {
            id: item.id,
            component,
            crud: {
              widget: item,
              isStoreWidget: true,
              saveWidget: this.saveWidget,
              closeDialog: () => { },
            },
          };
        } catch (e) {
          return {
            id: item.id,
            component: 'InvalidWidget',
            crud: {
              widget: item,
              isStoreWidget: true,
              saveWidget: this.saveWidget,
              closeDialog: () => { },
              error: e.toString(),
            },
          };
          // return {
          //   widget: item,
          //   component: 'InvalidWidget',
          //   error: e.toString(),
          // };
        }
      });
  }

  get isMobile(): boolean {
    return this.$q.platform.is.mobile;
  }

  async onChangePositions(id: string, pinnedPosition: XYPosition | null, order: string[]): Promise<void> {
    try {
      // Make a local change to the validated item, to avoid it jumping during the store round trip
      const local = this.validatedItems.find(valItem => valItem.id === id);
      if (local) {
        local.crud.widget.pinnedPosition = pinnedPosition;
      }
      await dashboardStore.saveDashboardItem({ ...dashboardStore.dashboardItemById(id), pinnedPosition });
      await dashboardStore.updateDashboardItemOrder(order);
    } catch (e) {
      throw e;
    }
  }

  async onChangeSize(id: string, cols: number, rows: number): Promise<void> {
    await dashboardStore.updateDashboardItemSize({ id, cols, rows });
  }

  public async saveWidget(widget: DashboardItem): Promise<void> {
    await dashboardStore.saveDashboardItem(widget);
  }

  onIdChanged(oldId, newId): void {
    if (newId && this.$route.path === `/dashboard/${oldId}`) {
      this.$router.replace(`/dashboard/${newId}`);
    }
  }

  changeDashboardId(): void {
    const oldId = this.dashboard.id;
    startChangeDashboardId(this.dashboard, newId => this.onIdChanged(oldId, newId));
  }

  changeDashboardTitle(): void {
    const oldId = this.dashboard.id;
    startChangeDashboardTitle(this.dashboard, newId => this.onIdChanged(oldId, newId));
  }

  toggleDefaultDashboard(): void {
    dashboardStore.updatePrimaryDashboard(this.dashboard.primary ? null : this.dashboardId);
  }

  removeDashboard(): void {
    startRemoveDashboard(this.dashboard);
  }
}
</script>

<template>
  <q-page padding>
    <q-inner-loading v-if="!dashboard">
      <q-spinner size="50px" color="primary" />
    </q-inner-loading>
    <div v-else>
      <portal to="toolbar-title">
        {{ dashboard.title }}
      </portal>
      <portal to="toolbar-buttons">
        <q-btn-toggle
          v-model="widgetEditable"
          class="q-mr-md"
          dark
          flat
          dense
          :options="[
            {icon:'mdi-arrow-all', value: true},
            {icon:'mdi-lock', value: false},
          ]"
        />
        <q-btn-dropdown color="primary" label="actions">
          <q-list dark>
            <ActionItem icon="add" label="New Widget" @click="wizardModalOpen = true" />
            <q-item dark link clickable @click="toggleDefaultDashboard">
              <q-item-section avatar>
                <q-icon :color="dashboard.primary ? 'primary' : ''" name="home" />
              </q-item-section>
              <q-item-section>Toggle default dashboard</q-item-section>
            </q-item>
            <ActionItem icon="edit" label="Change dashboard ID" @click="changeDashboardId" />
            <ActionItem icon="edit" label="Change dashboard Title" @click="changeDashboardTitle" />
            <ActionItem icon="delete" label="Delete dashboard" @click="removeDashboard" />
          </q-list>
        </q-btn-dropdown>
      </portal>
      <q-dialog v-model="wizardModalOpen" no-backdrop-dismiss>
        <WizardPicker
          v-if="wizardModalOpen"
          :dashboard-id="dashboardId"
          initial-component="WidgetWizardPicker"
          @close="wizardModalOpen = false"
        />
      </q-dialog>
      <q-list v-if="isMobile" no-border>
        <q-item v-for="val in validatedItems" :key="val.id">
          <q-item-section>
            <component
              :is="val.component"
              :disabled="widgetEditable"
              :initial-crud="val.crud"
              :context="context"
              class="dashboard-item"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <GridContainer
        v-else
        :editable="widgetEditable"
        @change-positions="onChangePositions"
        @change-size="onChangeSize"
      >
        <component
          :is="val.component"
          v-for="val in validatedItems"
          :key="val.id"
          :disabled="widgetEditable"
          :initial-crud="val.crud"
          :context="context"
          :error="val.error"
          class="dashboard-item"
        />
      </GridContainer>
    </div>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../styles/quasar.variables.styl';
@import '../styles/quasar.styl';

.dashboard-item {
  background: $block-background;
  height: 100%;
  width: 100%;
}
</style>
