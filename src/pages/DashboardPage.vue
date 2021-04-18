<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { RenderedItem } from '@/components/grid/types';
import { useGlobals } from '@/composables';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { featureStore, WidgetContext } from '@/store/features';
import { systemStore } from '@/store/system';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { objectSorter } from '@/utils/functional';

export default defineComponent({
  name: 'DashboardPage',
  setup() {
    const widgetEditable = ref(false);
    const { dense } = useGlobals.setup();
    const router = useRouter();

    const context = computed<WidgetContext>(
      () => ({
        mode: 'Basic',
        container: 'Dashboard',
        size: dense.value ? 'Content' : 'Fixed',
      }),
    );

    const loaded = computed<boolean>(
      () => systemStore.loaded,
    );

    const dashboardId = computed<string>(
      () => router.currentRoute.value.params.id as string,
    );

    const dashboard = computed<Dashboard | null>(
      () => dashboardStore.dashboardById(dashboardId.value),
    );

    function showWizard(widget: boolean): void {
      createDialog({
        component: 'WizardDialog',
        componentProps: {
          initialWizard: widget ? 'WidgetWizardPicker' : null,
          activeDashboardId: dashboardId.value,
        },
      });
    }

    const widgets = computed<Widget[]>(
      () => widgetStore
        .widgets
        .filter(widget => widget.dashboard === dashboardId.value)
        .sort(objectSorter('order')),
    );

    const dashboardItems = computed<RenderedItem[]>(
      () => widgets.value.map(widget => ({
        widget,
        ...featureStore.widgetComponent(widget),
      })),
    );

    watch(
      () => dashboardId.value,
      () => widgetEditable.value = false,
    );

    watch(
      () => router.currentRoute.value,
      () => {
        // TODO(Bob) return to home if request dashboard doesn't exist
        // if (!router.currentRoute.value.path.startsWith('/dashboard')) {
        //   return;
        // }
        // if (!newV && oldV) {
        //   router.replace('/'); // Dashboard was removed
        // }
      },
      { immediate: true },
    );

    watch(
      () => dashboard.value?.title,
      v => document.title = `Brewblox | ${v ?? 'Dashboard'}`,
      { immediate: true },
    );

    return {
      dense,
      widgetEditable,
      context,
      loaded,
      dashboardId,
      dashboard,
      showWizard,
      widgets,
      dashboardItems,
    };
  },
});
</script>

<template>
  <q-page style="overflow: auto" class="page-height">
    <PageError v-if="!dashboard">
      <span>Unknown dashboard: <b>{{ dashboardId }}</b></span>
    </PageError>
    <template v-else>
      <teleport to="#toolbar-title">
        {{ dashboard.title }}
      </teleport>
      <teleport to="#toolbar-buttons">
        <q-btn
          v-if="!dense"
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
        <ActionMenu
          round
          class="self-center"
        >
          <q-tooltip>
            Dashboard actions
          </q-tooltip>
          <template #menus>
            <DashboardActions :dashboard-id="dashboardId" />
          </template>
        </ActionMenu>
      </teleport>

      <div
        v-if="dashboardItems.length === 0"
        class="absolute-center"
      >
        <q-btn
          unelevated
          color="secondary"
          icon="mdi-creation"
          size="lg"
          label="Get started"
          @click="showWizard(false)"
        />
      </div>
      <div
        v-else-if="dense"
        class="column q-gutter-y-sm q-pa-md"
      >
        <component
          :is="val.component"
          v-for="val in dashboardItems"
          :key="val.widget.id"
          :widget-id="val.widget.id"
          :context="context"
          class="col full-width"
        />
      </div>
      <GridContainer
        v-else
        class="q-ma-lg"
        :items="dashboardItems"
        :context="context"
        :editable="widgetEditable"
        @dblclick="showWizard(true)"
      />
    </template>
  </q-page>
</template>
