<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { checkDatastore } from '@/helpers/datastore';
import { createDialog } from '@/helpers/dialog';

@Component
export default class DefaultLayout extends Vue {
  leftDrawerOpen = !this.$dense;
  dashboardEditing = false;
  serviceEditing = false;

  created(): void {
    checkDatastore();
  }

  get version(): string {
    return process.env.BLOX_VERSION || 'UNKNOWN';
  }

  get buildDate(): string {
    return process.env.BLOX_DATE || 'UNKNOWN';
  }

  showWizard(): void {
    createDialog({
      parent: this,
      component: 'WizardDialog',
    });
  }

  showPlugins(): void {
    createDialog({
      parent: this,
      component: 'PluginDialog',
    });
  }

  stopEditing(): void {
    this.dashboardEditing = false;
    this.serviceEditing = false;
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-bright">
    <LayoutHeader @menu="leftDrawerOpen = !leftDrawerOpen">
      <template #title>
        <portal-target name="toolbar-title">
          BrewBlox
        </portal-target>
      </template>
      <template #buttons>
        <portal-target name="toolbar-buttons" class="toolbar-buttons" />
      </template>
    </LayoutHeader>

    <q-drawer v-model="leftDrawerOpen" content-class="bg-dark column" elevated>
      <SidebarNavigator active-section="dashboards" />

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <DashboardIndex v-model="dashboardEditing" />
        <ServiceIndex v-model="serviceEditing" />
      </q-scroll-area>

      <q-item class="col-auto">
        <q-item-section class="col-auto">
          <q-btn flat text-color="white" icon="mdi-puzzle" @click="showPlugins">
            <q-tooltip>
              Plugins
            </q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn-dropdown flat text-color="white" icon="mdi-bug-outline">
            <q-list bordered>
              <LabeledField :value="version" label="Version" item-aligned dense />
              <LabeledField :value="buildDate" label="Build date" item-aligned dense />
              <q-separator inset />
              <ExportErrorsAction />
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
    </q-drawer>

    <Watchers />
    <ServiceWatchers />

    <q-page-container @click.native="stopEditing">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass">
@import "src/css/app.sass";

.q-layout
  overflow-x: auto
</style>
