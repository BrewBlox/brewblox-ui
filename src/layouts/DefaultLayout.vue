<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

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

  showWizard(): void {
    createDialog({
      component: 'WizardDialog',
    });
  }

  stopEditing(): void {
    this.dashboardEditing = false;
    this.serviceEditing = false;
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

      <q-item class="col-auto">
        <q-item-section class="col-auto">
          <q-btn-dropdown flat text-color="white" icon="mdi-bug-outline">
            <q-list bordered>
              <LabeledField :value="buildDate" label="Build date" item-aligned dense />
              <q-separator inset />
              <ExportErrorsAction />
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
        <q-item-section v-if="devMode" class="col-auto">
          <q-btn flat text-color="white" icon="mdi-format-paint" to="/styles">
            <q-tooltip>
              Theming
            </q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
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
