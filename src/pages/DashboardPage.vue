<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { RenderedItem } from '@/components/grid/types';
import { useGlobals } from '@/composables';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { featureStore, WidgetContext } from '@/store/features';
import { Widget, widgetStore } from '@/store/widgets';
import { startChangeDashboardTitle } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { objectSorter } from '@/utils/functional';

export default defineComponent({
  name: 'DashboardPage',
  props: {
    routeId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
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

    const dashboardId = computed<string | null>(
      () => props.routeId ?? null,
    );

    const dashboard = computed<Dashboard | null>(
      () => dashboardId.value
        ? dashboardStore.dashboardById(dashboardId.value)
        : null,
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

    function editTitle(): void {
      if (dashboard.value) {
        startChangeDashboardTitle(
          dashboard.value,
          newId => router.replace(`/dashboard/${newId}`),
        );
      }
    }

    watch(
      () => dashboardId.value,
      () => widgetEditable.value = false,
    );

    watch(
      () => dashboard.value,
      (newV) => {
        // We want to re-route to home if:
        // - the dashboard was removed
        // - the user navigates to a dashboard ID that does not exist (or just /dashboard)
        // - dashboards are loaded from the datastore
        if (newV === null && dashboardId.value !== null && dashboardStore.dashboards.length > 0) {
          router.replace('/');
        }
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
      dashboardId,
      dashboard,
      showWizard,
      widgets,
      dashboardItems,
      editTitle,
    };
  },
});
</script>

<template>
  <q-page
    class="page-height"
    @dblclick="showWizard(true)"
  >
    <PageError v-if="!dashboard">
      <span>Unknown dashboard: <b>{{ dashboardId }}</b></span>
    </PageError>
    <template v-else>
      <TitleTeleport>
        <span @click="editTitle">{{ dashboard.title }}</span>
      </TitleTeleport>
      <ButtonsTeleport>
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
      </ButtonsTeleport>

      <q-scroll-area class="fit">
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
          <WidgetProvider
            v-for="val in dashboardItems"
            :key="val.widget.id"
            :widget-id="val.widget.id"
            :context="context"
          >
            <component
              :is="val.component"
              :error="val.error"
              class="col full-width"
              @dblclick.stop
            />
          </WidgetProvider>
        </div>
        <GridContainer
          v-else
          class="q-ma-lg"
          :items="dashboardItems"
          :context="context"
          :editable="widgetEditable"
        />
      </q-scroll-area>
    </template>
  </q-page>
</template>
