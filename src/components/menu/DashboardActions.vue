<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

import { Dashboard, dashboardStore } from '@/store/dashboards';
import { systemStore } from '@/store/system';
import {
  startChangeDashboardId,
  startChangeDashboardTitle,
  startRemoveDashboard,
} from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'DashboardActions',
  props: {
    dashboardId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();

    const dashboard = computed<Dashboard | null>(
      () => dashboardStore.dashboardById(props.dashboardId),
    );

    const title = computed<string>(
      () => dashboard.value?.title ?? props.dashboardId,
    );

    const isHomePage = computed<boolean>(
      () => systemStore.config.homePage === `/dashboard/${props.dashboardId}`,
    );

    function showWizard(): void {
      createDialog({
        component: 'WizardDialog',
        componentProps: {
          initialWizard: 'WidgetWizardPicker',
          activeDashboardId: props.dashboardId,
        },
      });
    }

    function onIdChanged(oldId: string, newId: string): void {
      if (newId && router.currentRoute.value.path === `/dashboard/${oldId}`) {
        router.replace(`/dashboard/${newId}`);
      }
    }

    function changeDashboardId(): void {
      if (!dashboard.value) { return; }
      const oldId = props.dashboardId;
      startChangeDashboardId(dashboard.value, newId => onIdChanged(oldId, newId));
    }

    function changeDashboardTitle(): void {
      if (!dashboard.value) { return; }
      const oldId = props.dashboardId;
      startChangeDashboardTitle(dashboard.value, newId => onIdChanged(oldId, newId));
    }

    function removeDashboard(): void {
      if (!dashboard.value) { return; }
      startRemoveDashboard(dashboard.value);
    }

    return {
      dashboard,
      title,
      isHomePage,
      showWizard,
      changeDashboardId,
      changeDashboardTitle,
      removeDashboard,
    };
  },
});
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
        @click="changeDashboardId"
      />
      <ActionItem
        icon="edit"
        label="Rename dashboard"
        @click="changeDashboardTitle"
      />
      <ActionItem
        icon="delete"
        label="Remove dashboard"
        @click="removeDashboard"
      />
    </template>
  </ActionSubmenu>
</template>
