<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ValidatedWidget } from '@/components/grid/types';
import { useGlobals } from '@/composables';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext } from '@/store/features';
import { systemStore } from '@/store/system';
import { Widget, widgetStore } from '@/store/widgets';
import { createDialog } from '@/utils/dialog';
import { objectSorter, patchedById } from '@/utils/functional';

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

    async function patchWidgets(updated: Patch<Widget>[]): Promise<void> {
      const applied = updated
        .map(change => patchedById(widgetStore.widgets, change))
        .filter((v): v is Widget => v !== null);
      await Promise.all(applied.map(v => widgetStore.saveWidget(v)));
    }

    async function saveWidget(widget: Widget): Promise<void> {
      await widgetStore.saveWidget(widget);
    }

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

    const validatedWidgets = computed<ValidatedWidget[]>(
      () => widgets.value
        .map(widget => {
          const crud: Crud = {
            widget,
            saveWidget,
            isStoreWidget: true,
            closeDialog: () => { },
          };
          return {
            ...featureStore.widgetComponent(crud),
            id: widget.id,
            crud,
          };
        }),
    );

    watch(
      () => dashboardId.value,
      () => widgetEditable.value = false,
    );

    watch(
      () => dashboard.value,
      (newV, oldV) => {
        if (!newV && oldV) {
          // Dashboard was removed
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
      loaded,
      dashboardId,
      dashboard,
      patchWidgets,
      saveWidget,
      showWizard,
      widgets,
      validatedWidgets,
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
        v-if="validatedWidgets.length === 0"
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
          v-for="val in validatedWidgets"
          :key="val.id"
          :crud="val.crud"
          :context="context"
          class="col full-width"
        />
      </div>
      <GridContainer
        v-else
        class="q-ma-lg"
        :widgets="validatedWidgets"
        :context="context"
        :editable="widgetEditable"
        @patch:widgets="patchWidgets"
        @dblclick="showWizard(true)"
      >
        <!-- <component
          :is="val.component"
          v-for="val in validatedWidgets"
          :key="val.id"
          :crud="val.crud"
          :context="context"
          :error="val.error"
          class="fit"
        /> -->
      </GridContainer>
    </template>
  </q-page>
</template>
