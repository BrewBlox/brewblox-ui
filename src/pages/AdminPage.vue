<script lang="ts">
import { computed, defineComponent } from 'vue';

import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';
import {
  startChangeKeyboardLayout,
  startChangeTempUnit,
  startEditBuilderTouchDelay,
  systemStore,
} from '@/store/system';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';

interface ConfigService {
  serviceId: string;
  title: string;
  configComponent: string;
}

const orderSorter = makeObjectSorter<{ order: number }>('order');

export default defineComponent({
  name: 'AdminPage',
  setup() {
    const startupDone = computed<boolean>(
      () => systemStore.startupDone,
    );

    const experimental = computed<boolean>({
      get: () => systemStore.config.experimental,
      set: v => systemStore.saveConfig({ experimental: v }),
    });

    const showSidebarLayouts = computed<boolean>({
      get: () => systemStore.config.showSidebarLayouts,
      set: v => systemStore.saveConfig({ showSidebarLayouts: v }),
    });

    const buildDate = computed<string>(
      () => process.env.BLOX_DATE ?? 'UNKNOWN',
    );

    const dashboards = computed<Dashboard[]>(
      () => [...dashboardStore.dashboards]
        .sort(orderSorter),
    );

    const serviceComponents = computed<ConfigService[]>(
      () => [...serviceStore.services]
        .sort(orderSorter)
        .map(v => ({
          serviceId: v.id,
          title: v.title,
          configComponent: featureStore.serviceById(v.type)?.configComponent,
        }))
        .filter((v): v is ConfigService => !!v.configComponent),
    );

    const layouts = computed<BuilderLayout[]>(
      () => [...builderStore.layouts]
        .sort(orderSorter),
    );

    return {
      createDialog,
      startChangeKeyboardLayout,
      startChangeTempUnit,
      startEditBuilderTouchDelay,
      startupDone,
      experimental,
      showSidebarLayouts,
      buildDate,
      dashboards,
      serviceComponents,
      layouts,
    };
  },
});
</script>

<template>
  <q-page class="page-height overflow-auto">
    <PageError v-if="!startupDone" />
    <div v-else class="column q-pa-lg">
      <div class="text-h5">
        System
      </div>

      <ActionItem
        label="Start a wizard"
        icon="mdi-creation"
        class="text-secondary text-h6 text-bold"
        @click="createDialog({component: 'WizardDialog'})"
      />

      <q-expansion-item
        label="General settings"
        group="expansion"
        header-class="text-h6 admin-header"
        expand-icon-class="fade-4"
        switch-toggle-side
      >
        <ActionSubmenu
          class="q-ml-md"
        >
          <ToggleAction
            v-model="experimental"
            label="Experimental features"
            :colored="false"
          />
          <ToggleAction
            v-model="showSidebarLayouts"
            label="Show builder layouts in sidebar"
            :colored="false"
          />
          <ActionItem
            label="On-screen keyboard layout"
            icon="mdi-keyboard"
            @click="startChangeKeyboardLayout"
          />
          <ActionItem
            icon="mdi-temperature-celsius"
            label="Temperature units"
            @click="startChangeTempUnit"
          />
          <ActionItem
            icon="mdi-gesture-tap-hold"
            label="Accidental touch prevention"
            @click="startEditBuilderTouchDelay"
          />
        </actionsubmenu>
      </q-expansion-item>

      <q-expansion-item
        label="Debugging"
        group="expansion"
        header-class="text-h6 admin-header"
        expand-icon-class="fade-4"
        switch-toggle-side
      >
        <ActionSubmenu
          class="q-ml-md"
        >
          <q-item class="fade-4">
            <q-item-section avatar>
              <q-icon name="mdi-factory" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                Build date
              </q-item-label>
              {{ buildDate }}
            </q-item-section>
          </q-item>
          <ExportErrorsAction />
        </ActionSubmenu>
      </q-expansion-item>

      <div class="q-my-md">
        <q-separator />
      </div>

      <div class="text-h5">
        Dashboards
      </div>

      <div
        v-if="dashboards.length === 0"
        class="text-italic fade-2"
      >
        There are no dashboards
      </div>

      <q-expansion-item
        v-for="dash in dashboards"
        :key="'dashboard-'+dash.id"
        :label="dash.title"
        group="expansion"
        header-class="text-h6 admin-header"
        expand-icon-class="fade-4"
        switch-toggle-side
      >
        <DashboardActions
          :dashboard-id="dash.id"
          class="q-ml-md"
        />
      </q-expansion-item>


      <div class="q-my-md">
        <q-separator />
      </div>

      <div class="text-h5">
        Services
      </div>

      <div
        v-if="serviceComponents.length === 0"
        class="text-italic fade-2"
      >
        There are no services
      </div>

      <q-expansion-item
        v-for="svc in serviceComponents"
        :key="'service-'+svc.serviceId"
        :label="svc.title"
        group="expansion"
        header-class="text-h6 admin-header"
        expand-icon-class="fade-4"
        switch-toggle-side
      >
        <component
          :is="svc.configComponent"
          :service-id="svc.serviceId"
          class="q-ml-md"
        />
      </q-expansion-item>

      <div class="q-my-md">
        <q-separator />
      </div>

      <div class="text-h5">
        Builder layouts
      </div>

      <div
        v-if="layouts.length === 0"
        class="text-italic fade-2"
      >
        There are no builder layouts
      </div>

      <q-expansion-item
        v-for="layout in layouts"
        :key="'layout-'+layout.id"
        :label="layout.title"
        group="expansion"
        header-class="text-h6 admin-header"
        expand-icon-class="fade-4"
        switch-toggle-side
      >
        <LayoutActions
          class="q-ml-md"
          :layout="layout"
          no-label
        >
          <ActionItem
            :to="`/builder/${layout.id}`"
            icon="mdi-tools"
            label="Edit layout"
          />
        </LayoutActions>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<style lang="sass">
// not scoped
.q-expansion-item--expanded .admin-header
  opacity: 1
  font-size: 120%
  color: $primary
</style>
