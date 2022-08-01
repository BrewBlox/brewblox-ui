<script lang="ts">
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { useSystemStore } from '@/store/system';
import { userUISettings } from '@/user-settings';
import {
  startChangeDashboardId,
  startChangeDashboardTitle,
  startRemoveDashboard,
} from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'DashboardActions',
  props: {
    dashboardId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const dashboardStore = useDashboardStore();
    const systemStore = useSystemStore();
    const router = useRouter();

    const dashboard = computed<Dashboard | null>(() =>
      dashboardStore.dashboardById(props.dashboardId),
    );

    const title = computed<string>(
      () => dashboard.value?.title ?? props.dashboardId,
    );

    const isHomePage = computed<boolean>({
      get: () =>
        userUISettings.value.homePage === `/dashboard/${props.dashboardId}`,
      set: (v) =>
        systemStore.patchUserUISettings({
          homePage: v ? `/dashboard/${props.dashboardId}` : null,
        }),
    });

    const listed = computed<boolean>({
      get: () => dashboard.value?.listed ?? true,
      set: (v) => {
        if (dashboard.value) {
          dashboardStore.saveDashboard({ ...dashboard.value, listed: v });
        }
      },
    });

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
      if (!dashboard.value) {
        return;
      }
      const oldId = props.dashboardId;
      startChangeDashboardId(dashboard.value, (newId) =>
        onIdChanged(oldId, newId),
      );
    }

    function changeDashboardTitle(): void {
      if (!dashboard.value) {
        return;
      }
      const oldId = props.dashboardId;
      startChangeDashboardTitle(dashboard.value, (newId) =>
        onIdChanged(oldId, newId),
      );
    }

    function changeDashboardPath(): void {
      if (!dashboard.value) {
        return;
      }
      createDialog({
        component: 'InputDialog',
        componentProps: {
          title: 'Set dashboard path',
          message:
            'Dashboards with the same path are shown together. ' +
            'Use / to created nested directories.',
          modelValue: dashboard.value.path ?? '',
        },
      }).onOk((path: string) => {
        if (!dashboard.value) {
          return;
        }
        dashboardStore.saveDashboard({
          ...dashboard.value,
          path,
        });
      });
    }

    function removeDashboard(): void {
      if (!dashboard.value) {
        return;
      }
      startRemoveDashboard(dashboard.value);
    }

    return {
      dashboard,
      title,
      isHomePage,
      listed,
      showWizard,
      changeDashboardId,
      changeDashboardTitle,
      changeDashboardPath,
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
      <ToggleAction
        v-model="listed"
        label="Show in sidebar"
      />
      <ActionItem
        icon="edit"
        label="Change URL"
        @click="changeDashboardId"
      />
      <ActionItem
        icon="edit"
        label="Change name"
        @click="changeDashboardTitle"
      />
      <ActionItem
        icon="edit"
        label="Change path"
        @click="changeDashboardPath"
      />
      <ActionItem
        icon="delete"
        label="Remove"
        @click="removeDashboard"
      />
    </template>
  </ActionSubmenu>
</template>
