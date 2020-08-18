<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { Dashboard, dashboardStore, Widget } from '@/store/dashboards';
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

  @Watch('dashboardId')
  onChangeDashboardId(): void {
    this.widgetEditable = false;
  }

  @Watch('dashboard', { immediate: true })
  onChangeDashboard(newV: Dashboard, oldV: Dashboard): void {
    if (!newV && oldV) {
      // Dashboard was removed
      this.$router.replace('/');
    }
  }

  @Watch('dashboard.title', { immediate: true })
  watchTitle(newV: string): void {
    document.title = `Brewblox | ${newV ?? 'Dashboard'}`;
  }

  get context(): WidgetContext {
    return {
      mode: 'Basic',
      container: 'Dashboard',
      size: this.$dense ? 'Content' : 'Fixed',
    };
  }

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard(): Dashboard | null {
    return dashboardStore.dashboardById(this.dashboardId);
  }

  get widgets(): Widget[] {
    // Avoid modifying the store object
    return [...dashboardStore.dashboardWidgets(this.dashboardId)]
      .sort(objectSorter('order'));
  }

  get validatedWidgets(): ValidatedWidget[] {
    return this.widgets
      .map((widget: Widget) => {
        const crud: Crud = {
          widget,
          isStoreWidget: true,
          saveWidget: this.saveWidget,
          closeDialog: () => { },
        };
        return {
          ...featureStore.widgetComponent(crud),
          id: widget.id,
          crud,
        };
      });
  }

  async patchWidgets(updated: Patch<Widget>[]): Promise<void> {
    await dashboardStore.patchWidgets(updated);
  }

  public async saveWidget(widget: Widget): Promise<void> {
    await dashboardStore.saveWidget(widget);
  }

  onIdChanged(oldId, newId): void {
    if (newId && this.$route.path === `/dashboard/${oldId}`) {
      this.$router.replace(`/dashboard/${newId}`);
    }
  }

  editDashboardId(): void {
    if (!this.dashboard) { return; }
    const oldId = this.dashboard.id;
    startChangeDashboardId(this.dashboard, newId => this.onIdChanged(oldId, newId));
  }

  editDashboardTitle(): void {
    if (!this.dashboard) { return; }
    const oldId = this.dashboard.id;
    startChangeDashboardTitle(this.dashboard, newId => this.onIdChanged(oldId, newId));
  }

  toggleDefaultDashboard(): void {
    if (!this.dashboard) { return; }
    dashboardStore.updatePrimaryDashboard(this.dashboard.primary ? null : this.dashboardId);
  }

  removeDashboard(): void {
    if (!this.dashboard) { return; }
    startRemoveDashboard(this.dashboard);
  }

  showWizard(): void {
    createDialog({
      component: 'WizardDialog',
      initialWizard: 'WidgetWizardPicker',
      activeDashboardId: this.dashboardId,
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
        <q-btn
          v-if="!$dense"
          unelevated
          round
          icon="mdi-arrow-all"
          :color="widgetEditable ? 'primary' : ''"
          class="self-center"
          @click="widgetEditable = !widgetEditable"
        >
          <q-tooltip v-if="!widgetEditable">
            Rearrange widgets
          </q-tooltip>
        </q-btn>
        <ActionMenu round class="self-center">
          <template #actions>
            <ActionItem icon="add" label="New Widget" @click="showWizard" />
            <q-item clickable @click="toggleDefaultDashboard">
              <q-item-section avatar>
                <q-icon :color="dashboard.primary ? 'primary' : ''" name="home" />
              </q-item-section>
              <q-item-section>
                {{ dashboard.primary ? 'Is home page' : 'Make home page' }}
              </q-item-section>
            </q-item>
            <ActionItem icon="edit" label="Change dashboard ID" @click="editDashboardId" />
            <ActionItem icon="edit" label="Change dashboard title" @click="editDashboardTitle" />
            <ActionItem icon="delete" label="Delete dashboard" @click="removeDashboard" />
          </template>
        </ActionMenu>
      </portal>

      <div v-if="$dense" class="column q-gutter-y-sm">
        <component
          :is="val.component"
          v-for="val in validatedWidgets"
          :key="val.id"
          :initial-crud="val.crud"
          :context="context"
          class="col full-width"
        />
      </div>
      <GridContainer
        v-else
        :editable="widgetEditable"
        @patch:widgets="patchWidgets"
        @dblclick="showWizard"
      >
        <component
          :is="val.component"
          v-for="val in validatedWidgets"
          :key="val.id"
          :initial-crud="val.crud"
          :context="context"
          :error="val.error"
          class="fit"
        />
      </GridContainer>
    </div>
  </q-page>
</template>
