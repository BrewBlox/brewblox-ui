<script lang="ts">
import KeyboardLayouts from 'simple-keyboard-layouts';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectSorter } from '@/helpers/functional';
import { builderStore } from '@/plugins/builder/store';
import { BuilderLayout } from '@/plugins/builder/types';
import { dashboardStore } from '@/store/dashboards';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';

interface ConfigService {
  serviceId: string;
  configComponent: string;
}

@Component
export default class ConfigPage extends Vue {

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

  get dashboardIds(): string[] {
    return [...dashboardStore.dashboards]
      .sort(objectSorter('order'))
      .map(v => v.id);
  }

  get serviceComponents(): ConfigService[] {
    return [...serviceStore.services]
      .sort(objectSorter('order'))
      .map(v => ({
        serviceId: v.id,
        configComponent: featureStore.serviceById(v.type)?.configComponent,
      }))
      .filter((v): v is ConfigService => !!v.configComponent);
  }

  get layouts(): BuilderLayout[] {
    return [...builderStore.layouts]
      .sort(objectSorter('order'));
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
}
</script>

<template>
  <q-page class="page-height overflow-auto">
    <div class="row q-pa-lg q-gutter-lg">
      <div class="text-h5 text-grey-4 text-italic">
        System
      </div>
      <div class="col-break q-my-none" />

      <ActionSubmenu label="Global settings">
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
      </ActionSubmenu>

      <ActionSubmenu label="Debugging">
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

      <div class="col-break" />
      <div class="text-h5 text-grey-4 text-italic">
        Dashboards
      </div>
      <div class="col-break q-my-none" />

      <div
        v-if="dashboardIds.length === 0"
        class="text-grey-4 text-italic"
      >
        There are no dashboards
      </div>

      <DashboardActions
        v-for="id in dashboardIds"
        :key="'dashboard-'+id"
        :dashboard-id="id"
      />

      <div class="col-break" />
      <div class="text-h5 text-grey-4 text-italic">
        Services
      </div>
      <div class="col-break q-my-none" />

      <div
        v-if="serviceComponents.length === 0"
        class="text-grey-4 text-italic"
      >
        There are no services
      </div>

      <component
        :is="svc.configComponent"
        v-for="svc in serviceComponents"
        :key="'service-'+svc.serviceId"
        :service-id="svc.serviceId"
      />

      <div class="col-break" />
      <div class="text-h5 text-grey-4 text-italic">
        Builder layouts
      </div>
      <div class="col-break q-my-none" />

      <div
        v-if="layouts.length === 0"
        class="text-grey-4 text-italic"
      >
        There are no builder layouts
      </div>

      <LayoutActions
        v-for="layout in layouts"
        :key="'layout-'+layout.id"
        :layout="layout"
      >
        <ActionItem
          :to="`/builder/${layout.id}`"
          icon="mdi-tools"
          label="Edit layout"
        />
      </LayoutActions>
    </div>
  </q-page>
</template>
