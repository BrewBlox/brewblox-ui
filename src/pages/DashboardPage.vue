<script setup lang="ts">
import { useGlobals, useKiosk } from '@/composables';
import { Dashboard, useDashboardStore } from '@/store/dashboards';
import { WidgetContext } from '@/store/features';
import { useWidgetStore, Widget } from '@/store/widgets';
import { startChangeDashboardTitle } from '@/utils/dashboards';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const widgetSorter = makeObjectSorter<Widget>('order');

const props = defineProps({
  routeId: {
    type: String,
    default: null,
  },
});

const dashboardStore = useDashboardStore();
const widgetStore = useWidgetStore();
const widgetEditable = ref(false);
const { dense } = useGlobals.setup();
const { kiosk } = useKiosk.setup();
const router = useRouter();

const context = computed<WidgetContext>(() => ({
  mode: 'Basic',
  container: 'Dashboard',
  size: dense.value ? 'Content' : 'Fixed',
}));

const dashboardId = computed<string | null>(() => props.routeId ?? null);

const dashboard = computed<Dashboard | null>(() =>
  dashboardId.value ? dashboardStore.dashboardById(dashboardId.value) : null,
);

const widgets = computed<Widget[]>(() =>
  widgetStore.widgets
    .filter((widget) => widget.dashboard === dashboardId.value)
    .sort(widgetSorter),
);

async function saveWidget(widget: Widget): Promise<void> {
  return widgetStore.saveWidget(widget);
}

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
</script>

<template>
  <q-page
    class="page-height"
    @dblclick="createDialog({ component: 'WidgetWizardDialog' })"
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
          v-if="widgets.length === 0"
          class="absolute-center"
        >
          <q-btn-dropdown
            unelevated
            label="Get started"
            icon="mdi-creation"
            color="secondary"
            size="lg"
          >
            <q-list>
              <ActionItem
                label="Quickstart"
                @click="createDialog({ component: 'QuickstartWizardDialog' })"
              />
              <ActionItem
                label="New block"
                @click="
                  createDialog({
                    component: 'BlockWizardDialog',
                    componentProps: { addWidget: true },
                  })
                "
              />
              <ActionItem
                label="New widget"
                @click="createDialog({ component: 'WidgetWizardDialog' })"
              />
            </q-list>
          </q-btn-dropdown>
        </div>
        <div
          v-else-if="dense"
          class="column q-gutter-y-sm q-pa-md"
          style="width: 100vw"
        >
          <WidgetWrapper
            v-for="widget in widgets"
            :key="widget.id"
            :widget="widget"
            :context="context"
            class="col"
            @update:widget="saveWidget"
            @dblclick.stop
          />
        </div>
        <GridContainer
          v-else
          :class="['q-ma-lg', kiosk && 'q-mt-xl']"
          :widgets="widgets"
          :context="context"
          :editable="widgetEditable"
        />
      </q-scroll-area>
    </template>
  </q-page>
</template>
