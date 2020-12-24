<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { startChangeDashboardId, startChangeDashboardTitle, startRemoveDashboard } from '@/helpers/dashboards';
import { createDialog } from '@/helpers/dialog';
import { Dashboard, dashboardStore } from '@/store/dashboards';


@Component
export default class DashboardActions extends Vue {

  @Prop({ type: String, required: true })
  public readonly dashboardId!: string;

  get dashboard(): Dashboard | null {
    return dashboardStore.dashboardById(this.dashboardId);
  }

  get title(): string {
    return this.dashboard?.title ?? this.dashboardId;
  }

  showWizard(): void {
    createDialog({
      component: 'WizardDialog',
      initialWizard: 'WidgetWizardPicker',
      activeDashboardId: this.dashboardId,
    });
  }

  onIdChanged(oldId: string, newId: string): void {
    if (newId && this.$route.path === `/dashboard/${oldId}`) {
      this.$router.replace(`/dashboard/${newId}`);
    }
  }

  toggleDefaultDashboard(dashboard: Dashboard): void {
    dashboardStore.updatePrimaryDashboard(dashboard.primary ? null : dashboard.id);
  }

  changeDashboardId(dashboard: Dashboard): void {
    const oldId = dashboard.id;
    startChangeDashboardId(dashboard, newId => this.onIdChanged(oldId, newId));
  }

  changeDashboardTitle(dashboard: Dashboard): void {
    const oldId = dashboard.id;
    startChangeDashboardTitle(dashboard, newId => this.onIdChanged(oldId, newId));
  }

  removeDashboard(dashboard: Dashboard): void {
    startRemoveDashboard(dashboard);
  }
}
</script>

<template>
  <ActionSubmenu
    :label="title"
  >
    <template v-if="dashboard">
      <ActionItem
        icon="add"
        label="New Widget"
        @click="showWizard"
      />
      <q-item
        clickable
        @click="toggleDefaultDashboard(dashboard)"
      >
        <q-item-section avatar>
          <q-icon
            :color="dashboard.primary ? 'primary' : ''"
            name="home"
          />
        </q-item-section>
        <q-item-section>
          {{ dashboard.primary ? 'Is home page' : 'Make home page' }}
        </q-item-section>
      </q-item>
      <ActionItem
        icon="edit"
        label="Change dashboard URL"
        @click="changeDashboardId(dashboard)"
      />
      <ActionItem
        icon="edit"
        label="Change dashboard title"
        @click="changeDashboardTitle(dashboard)"
      />
      <ActionItem
        icon="delete"
        label="Remove dashboard"
        @click="removeDashboard(dashboard)"
      />
    </template>
  </ActionSubmenu>
</template>
