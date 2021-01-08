<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Watch } from 'vue-property-decorator';

import { objectSorter } from '@/helpers/functional';
import { Dashboard, dashboardStore, Widget } from '@/store/dashboards';
import { Crud, featureStore, WidgetContext } from '@/store/features';
import { systemStore } from '@/store/system';

import { createDialog } from '../helpers/dialog';

interface ValidatedWidget {
  id: string;
  component: string;
  crud: Crud;
  error?: string;
}

@Component
export default class DashboardPage extends Vue {
  widgetEditable = false;

  @Watch('dashboardId')
  onChangeDashboardId(): void {
    this.widgetEditable = false;
  }

  @Watch('dashboard', { immediate: true })
  onChangeDashboard(newV: Dashboard, oldV: Dashboard): void {
    if (!newV && oldV) {
      // Dashboard was removed
      this.$router.replace('/');
    }
  }

  @Watch('dashboard.title', { immediate: true })
  watchTitle(newV: string): void {
    document.title = `Brewblox | ${newV ?? 'Dashboard'}`;
  }

  get context(): WidgetContext {
    return {
      mode: 'Basic',
      container: 'Dashboard',
      size: this.$dense ? 'Content' : 'Fixed',
    };
  }

  get loaded(): boolean {
    return systemStore.loaded;
  }

  get dashboardId(): string {
    return this.$route.params.id;
  }

  get dashboard(): Dashboard | null {
    return dashboardStore.dashboardById(this.dashboardId);
  }

  get widgets(): Widget[] {
    // Avoid modifying the store object
    return [...dashboardStore.dashboardWidgets(this.dashboardId)]
      .sort(objectSorter('order'));
  }

  get validatedWidgets(): ValidatedWidget[] {
    return this.widgets
      .map((widget: Widget) => {
        const crud: Crud = {
          widget,
          isStoreWidget: true,
          saveWidget: this.saveWidget,
          closeDialog: () => { },
        };
        return {
          ...featureStore.widgetComponent(crud),
          id: widget.id,
          crud,
        };
      });
  }

  async patchWidgets(updated: Patch<Widget>[]): Promise<void> {
    await dashboardStore.patchWidgets(updated);
  }

  public async saveWidget(widget: Widget): Promise<void> {
    await dashboardStore.saveWidget(widget);
  }

  showWizard(widget: boolean): void {
    createDialog({
      component: 'WizardDialog',
      initialWizard: widget ? 'WidgetWizardPicker' : null,
      activeDashboardId: this.dashboardId,
    });
  }
}
</script>

<template>
  <q-page style="overflow: auto" class="page-height">
    <template v-if="!dashboard">
      <PageError v-if="!dashboard">
        <span>Unknown dashboard: <b>{{ dashboardId }}</b></span>
      </PageError>
    </template>
    <div v-else class="q-pa-lg">
      <portal to="toolbar-title">
        {{ dashboard.title }}
      </portal>
      <portal to="toolbar-buttons">
        <q-btn
          v-if="!$dense"
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
      </portal>

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
        v-else-if="$dense"
        class="column q-gutter-y-sm"
      >
        <component
          :is="val.component"
          v-for="val in validatedWidgets"
          :key="val.id"
          :initial-crud="val.crud"
          :context="context"
          class="col full-width"
        />
      </div>
      <GridContainer
        v-else
        :editable="widgetEditable"
        @patch:widgets="patchWidgets"
        @dblclick="showWizard(true)"
      >
        <component
          :is="val.component"
          v-for="val in validatedWidgets"
          :key="val.id"
          :initial-crud="val.crud"
          :context="context"
          :error="val.error"
          class="fit"
        />
      </GridContainer>
    </div>
  </q-page>
</template>
