<script lang="ts">
import { RenderedItem } from '@/components/grid/types';
import { useGlobals, usePanels } from '@/composables';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { useFeatureStore, WidgetContext } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { startChangeDashboardTitle } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const widgetSorter = makeObjectSorter<Widget>('order');

export default defineComponent({
  name: 'DashboardPage',
  props: {
    routeId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const dashboardStore = useDashboardStore();
    const widgetStore = useWidgetStore();
    const featureStore = useFeatureStore();
    const widgetEditable = ref(false);
    const { dense } = useGlobals.setup();
    const { panels } = usePanels.setup();
    const router = useRouter();

    const context = computed<WidgetContext>(() => ({
      mode: 'Basic',
      container: 'Dashboard',
      size: dense.value ? 'Content' : 'Fixed',
    }));

    const dashboardId = computed<string | null>(() => props.routeId ?? null);

    const dashboard = computed<Dashboard | null>(() =>
      dashboardId.value
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

    const widgets = computed<Widget[]>(() =>
      widgetStore.widgets
        .filter((widget) => widget.dashboard === dashboardId.value)
        .sort(widgetSorter),
    );

    const dashboardItems = computed<RenderedItem[]>(() =>
      widgets.value.map((widget) => ({
        widget,
        ...featureStore.widgetComponent(widget),
      })),
    );

    watch(
      () => dashboardId.value,
      () => (widgetEditable.value = false),
    );

    watch(
      () => dashboard.value,
      (newV) => {
        // We want to re-route to home if:
        // - the dashboard was removed
        // - the user navigates to a dashboard ID that does not exist (or just /dashboard)
        // - dashboards are loaded from the datastore
        if (
          newV === null &&
          dashboardId.value !== null &&
          dashboardStore.dashboards.length > 0
        ) {
          router.replace('/');
        }
      },
      { immediate: true },
    );

    watch(
      () => dashboard.value?.title,
      (v) => (document.title = `Brewblox | ${v ?? 'Dashboard'}`),
      { immediate: true },
    );

    return {
      dense,
      panels,
      widgetEditable,
      context,
      dashboardId,
      dashboard,
      showWizard,
      widgets,
      dashboardItems,
      startChangeDashboardTitle,
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
      <span>
        Unknown dashboard: <b>{{ dashboardId }}</b>
      </span>
    </PageError>
    <template v-else>
      <TitleTeleport>
        <span
          class="cursor-pointer"
          @click="startChangeDashboardTitle(dashboard, $router)"
        >
          {{ dashboard.title }}
        </span>
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
          <q-tooltip v-if="!widgetEditable"> Rearrange widgets </q-tooltip>
        </q-btn>
        <ActionMenu
          round
          class="self-center"
        >
          <q-tooltip> Dashboard actions </q-tooltip>
          <template #menus>
            <DashboardActions
              v-if="dashboardId != null"
              :dashboard-id="dashboardId"
            />
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
          style="width: 100vw"
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
              class="col"
              @dblclick.stop
            />
          </WidgetProvider>
        </div>
        <GridContainer
          v-else
          :class="['q-ma-lg', !panels && 'q-mt-xl']"
          :items="dashboardItems"
          :context="context"
          :editable="widgetEditable"
        />
      </q-scroll-area>
    </template>
  </q-page>
</template>
