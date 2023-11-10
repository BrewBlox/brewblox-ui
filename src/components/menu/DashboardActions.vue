<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { useSystemStore } from '@/store/system';
import { userUISettings } from '@/user-settings';
import {
  startChangeDashboardId,
  startChangeDashboardTitle,
  startRemoveDashboard,
} from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';

interface Props {
  dashboardId: string;
}

const props = defineProps<Props>();

const dashboardStore = useDashboardStore();
const systemStore = useSystemStore();
const router = useRouter();

const dashboard = computed<Dashboard | null>(() =>
  dashboardStore.dashboardById(props.dashboardId),
);

const isHomePage = computed<boolean>({
  get: () =>
    userUISettings.value.homePage === `/dashboard/${props.dashboardId}`,
  set: (v) =>
    systemStore.patchUserUISettings({
      homePage: v ? `/dashboard/${props.dashboardId}` : null,
    }),
});

function startWidgetWizard(): void {
  createDialog({
    component: 'WidgetWizardDialog',
    componentProps: {
      dashboardId: props.dashboardId,
    },
  });
}

function changeDashboardId(): void {
  startChangeDashboardId(dashboard.value, router);
}

function changeDashboardTitle(): void {
  startChangeDashboardTitle(dashboard.value, router);
}

function removeDashboard(): void {
  startRemoveDashboard(dashboard.value, router);
}
</script>

<template>
  <ActionSubmenu>
    <template v-if="dashboard">
      <ActionItem
        icon="add"
        label="New widget"
        @click="startWidgetWizard"
      />
      <ToggleAction
        v-model="isHomePage"
        icon="home"
        :label="isHomePage ? 'Is home page' : 'Make home page'"
      />
      <ActionItem
        icon="edit"
        label="Change dashboard name"
        @click="changeDashboardTitle"
      />
      <ActionItem
        icon="edit"
        label="Change dashboard URL"
        @click="changeDashboardId"
      />
      <ActionItem
        icon="delete"
        label="Remove"
        @click="removeDashboard"
      />
    </template>
  </ActionSubmenu>
</template>
