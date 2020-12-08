<script lang="ts">
import KeyboardLayouts from 'simple-keyboard-layouts';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { systemStore } from '@/store/system';
;

@Component
export default class DefaultLayout extends Vue {
  localDrawer: boolean | null = null;
  dashboardEditing = false;
  serviceEditing = false;

  get drawerOpen(): boolean {
    return Boolean(
      this.localDrawer
      ?? this.$q.localStorage.getItem('drawer')
      ?? !this.$dense);
  }

  set drawerOpen(v: boolean) {
    this.localDrawer = v;
    this.$q.localStorage.set('drawer', v);
  }

  get buildDate(): string {
    return process.env.BLOX_DATE ?? 'UNKNOWN';
  }

  get devMode() {
    return process.env.DEV;
  }

  get experimental(): boolean {
    return systemStore.config.experimental;
  }

  set experimental(experimental: boolean) {
    systemStore.saveConfig({ experimental });
  }

  stopEditing(): void {
    this.dashboardEditing = false;
    this.serviceEditing = false;
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
  <q-layout view="hHh Lpr fFf">
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        <portal-target name="toolbar-title">
          Brewblox
        </portal-target>
      </template>
      <template #buttons>
        <portal-target name="toolbar-buttons" class="full-height row q-gutter-x-sm q-pr-xs" />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" content-class="column" elevated>
      <SidebarNavigator active-section="dashboards" />

      <q-scroll-area class="col" :thumb-style="{opacity: 0.5, background: 'silver'}">
        <DashboardIndex v-model="dashboardEditing" />
        <ServiceIndex v-model="serviceEditing" />
      </q-scroll-area>

      <div class="col-auto row q-gutter-sm q-pa-sm">
        <ActionMenu icon="mdi-bug-outline" label="Debugging">
          <template #actions>
            <ExportErrorsAction />
            <q-separator inset />
            <LabeledField
              :value="buildDate"
              label="Build date"
              item-aligned
              dense
            />
          </template>
        </ActionMenu>
        <ActionMenu icon="settings" label="Settings">
          <template #actions>
            <ActionItem
              :active="experimental"
              label="Enable experiments"
              icon="mdi-test-tube"
              style="min-width: 200px"
              @click="experimental = !experimental"
            />
            <ActionItem
              label="Set keyboard layout"
              icon="mdi-keyboard"
              @click="startChangeKeyboardLayout"
            />
          </template>
        </ActionMenu>
        <q-btn flat icon="mdi-format-paint" to="/styles">
          <q-tooltip>
            Theming
          </q-tooltip>
        </q-btn>
      </div>
    </q-drawer>

    <q-page-container @click.native="stopEditing">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass">
.q-layout
  overflow-x: auto
</style>
