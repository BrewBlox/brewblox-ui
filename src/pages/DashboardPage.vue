<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { Dashboard, dashboardStore, PersistentWidget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext } from '@/store/features';

import { startChangeDashboardId, startChangeDashboardTitle, startRemoveDashboard } from '../helpers/dashboards';
import { createDialog } from '../helpers/dialog';

interface ValidatedWidget {
  id: string;
  component: string;
  crud: Crud;
  error?: string;
}

@Component
export default class DashboardPage extends Vue {
  widgetEditable = false;

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

  get allItems(): PersistentWidget[] {
    return dashboardStore.widgetValues;
  }

  get widgets(): PersistentWidget[] {
    return dashboardStore.persistentWidgetsByDashboardId(this.dashboardId)
      .sort(objectSorter('order'));
  }

  get validatedWidgets(): ValidatedWidget[] {
    return this.widgets
      .map((widget: PersistentWidget) => {
        const crud: Crud = {
          widget,
          isStoreWidget: true,
          saveWidget: this.saveWidget,
          closeDialog: () => { },
        };
        try {
          if (widget.title === undefined) {
            // ensure backwards compatibility
            // older items may not have a title
            widget.title = widget.id;
          }
          const component = featureStore.widget(crud, true);
          return {
            id: widget.id,
            component,
            crud,
          };
        } catch (e) {
          return {
            id: widget.id,
            component: 'InvalidWidget',
            crud,
            error: e.message,
          };
        }
      });
  }

  get isMobile(): boolean {
    return this.$q.platform.is.mobile;
  }

  async onChangePositions(id: string, pinnedPosition: XYPosition | null, order: string[]): Promise<void> {
    try {
      // Make a local change to the validated item, to avoid it jumping during the store round trip
      const local = this.validatedWidgets.find(valItem => valItem.id === id);
      if (local) {
        local.crud.widget.pinnedPosition = pinnedPosition;
      }
      await dashboardStore.savePersistentWidget({ ...dashboardStore.persistentWidgetById(id), pinnedPosition });
      await dashboardStore.updatePersistentWidgetOrder(order);
    } catch (e) {
      throw e;
    }
  }

  async onChangeSize(id: string, cols: number, rows: number): Promise<void> {
    await dashboardStore.updatePersistentWidgetSize({ id, cols, rows });
  }

  public async saveWidget(widget: PersistentWidget): Promise<void> {
    await dashboardStore.savePersistentWidget(widget);
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

  showWizard(): void {
    createDialog({
      parent: this,
      component: 'WizardDialog',
      dashboardId: this.dashboardId,
      initialComponent: 'WidgetWizardPicker',
    });
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
          flat
          dense
          :options="[
            {icon:'mdi-arrow-all', value: true},
            {icon:'mdi-lock', value: false},
          ]"
        />
        <q-btn-dropdown color="primary" label="actions">
          <q-list>
            <ActionItem icon="add" label="New Widget" @click="showWizard" />
            <q-item link clickable @click="toggleDefaultDashboard">
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
      <q-list v-if="isMobile" no-border>
        <q-item v-for="val in validatedWidgets" :key="val.id">
          <q-item-section>
            <component
              :is="val.component"
              :initial-crud="val.crud"
              :context="context"
              class="dashboard-widget"
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
          v-for="val in validatedWidgets"
          :key="val.id"
          :initial-crud="val.crud"
          :context="context"
          :error="val.error"
          class="bg-dark maximized"
        />
      </GridContainer>
    </div>
  </q-page>
</template>

<style lang="stylus" scoped>
@import '../styles/quasar.variables.styl';
@import '../styles/quasar.styl';
</style>
