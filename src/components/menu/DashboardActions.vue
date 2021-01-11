<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { startChangeDashboardId, startChangeDashboardTitle, startRemoveDashboard } from '@/helpers/dashboards';
import { createDialog } from '@/helpers/dialog';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';


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

  get isHomePage(): boolean {
    return systemStore.config.homePage === `/dashboard/${this.dashboard?.id}`;
  }

  set isHomePage(v: boolean) {
    const homePage = v && this.dashboard ? `/dashboard/${this.dashboard.id}` : null;
    systemStore.saveConfig({ homePage });
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
  <ActionSubmenu>
    <template v-if="dashboard">
      <ActionItem
        icon="add"
        label="New widget"
        @click="showWizard"
      />
      <ToggleAction
        v-model="isHomePage"
        icon="home"
        :label="isHomePage ? 'Is home page' : 'Make home page'"
      />
      <ActionItem
        icon="edit"
        label="Change dashboard URL"
        @click="changeDashboardId(dashboard)"
      />
      <ActionItem
        icon="edit"
        label="Rename dashboard"
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
