<script lang="ts">
import KeyboardLayouts from 'simple-keyboard-layouts';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectSorter } from '@/helpers/functional';
import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { sparkStore } from '@/plugins/spark/store';
import { Dashboard, dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';
import { SystemConfig, systemStore } from '@/store/system';

interface ConfigService {
  serviceId: string;
  title: string;
  configComponent: string;
}

@Component
export default class AdminPage extends Vue {

  get experimental(): boolean {
    return systemStore.config.experimental;
  }

  set experimental(experimental: boolean) {
    systemStore.saveConfig({ experimental });
  }

  get showSidebarLayouts(): boolean {
    return systemStore.config.showSidebarLayouts;
  }

  set showSidebarLayouts(showSidebarLayouts: boolean) {
    systemStore.saveConfig({ showSidebarLayouts });
  }

  get buildDate(): string {
    return process.env.BLOX_DATE ?? 'UNKNOWN';
  }

  get dashboards(): Dashboard[] {
    return [...dashboardStore.dashboards]
      .sort(objectSorter('order'));
  }

  get serviceComponents(): ConfigService[] {
    return [...serviceStore.services]
      .sort(objectSorter('order'))
      .map(v => ({
        serviceId: v.id,
        title: v.title,
        configComponent: featureStore.serviceById(v.type)?.configComponent,
      }))
      .filter((v): v is ConfigService => !!v.configComponent);
  }

  get layouts(): BuilderLayout[] {
    return [...builderStore.layouts]
      .sort(objectSorter('order'));
  }

  get sparkServiceAvailable(): boolean {
    return sparkStore.modules.length > 0;
  }

  startChangeKeyboardLayout(): void {
    createDialog({
      component: 'SelectDialog',
      selectOptions: Object.keys(new KeyboardLayouts().layouts),
      value: systemStore.config.keyboardLayout,
      title: 'Select layout for virtual keyboard',
      selectProps: {
        label: 'Layout',
      },
    })
      .onOk(keyboardLayout => systemStore.saveConfig({ keyboardLayout }));
  }

  startEditBuilderTouchDelay(): void {
    const selectOptions: SelectOption<SystemConfig['builderTouchDelayed']>[] = [
      { label: 'Always', value: 'always' },
      { label: 'Never', value: 'never' },
      { label: 'Only on mobile', value: 'dense' },
    ];

    createDialog({
      component: 'SelectDialog',
      listSelect: true,
      selectOptions,
      title: 'Hold to interact with builder parts?',
      value: systemStore.config.builderTouchDelayed,
    })
      .onOk(builderTouchDelayed => systemStore.saveConfig({ builderTouchDelayed }));
  }

  openMenu(component: string): void {
    createDialog({ component });
  }
}
</script>

<template>
  <q-page class="page-height overflow-auto">
    <div class="column q-pa-lg q-gutter-sm">
      <div class="text-h5 text-italic">
        System
      </div>

      <ActionItem
        label="Wizardry"
        icon="mdi-creation"
        class="text-secondary"
        @click="openMenu('WizardDialog')"
      />

      <q-expansion-item
        label="General settings"
        group="expansion"
        header-class="text-h6 text-italic admin-header"
        switch-toggle-side
      >
        <ActionSubmenu
          class="q-ml-md"
        >
          <ToggleAction
            v-model="experimental"
            label="Experimental features"
          />
          <ToggleAction
            v-model="showSidebarLayouts"
            label="Show builder layouts in sidebar"
          />
          <ActionItem
            label="Set keyboard layout"
            icon="mdi-keyboard"
            @click="startChangeKeyboardLayout"
          />
          <ActionItem
            icon="mdi-temperature-celsius"
            label="Set temperature units"
            @click="openMenu('TempUnitMenu')"
          />
          <ActionItem
            icon="mdi-gesture-tap-hold"
            label="Set touch delay for builder layouts"
            @click="startEditBuilderTouchDelay"
          />
        </actionsubmenu>
      </q-expansion-item>

      <q-expansion-item
        label="Debugging"
        group="expansion"
        header-class="text-h6 text-italic admin-header"
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

      <div class="text-h5 text-italic q-mt-xl">
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
        header-class="text-h6 text-italic admin-header"
        switch-toggle-side
        class="q-ml-md"
      >
        <DashboardActions
          :dashboard-id="dash.id"
          class="q-ml-md"
        />
      </q-expansion-item>

      <div class="text-h5 text-italic q-mt-xl">
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
        header-class="text-h6 text-italic admin-header"
        switch-toggle-side
      >
        <component
          :is="svc.configComponent"
          :service-id="svc.serviceId"
          class="q-ml-lg"
        />
      </q-expansion-item>

      <div class="text-h5 text-italic q-mt-xl">
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
        header-class="text-h6 text-italic admin-header"
        switch-toggle-side
      >
        <LayoutActions
          class="q-ml-lg"
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
