<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { checkDatastore } from '@/helpers/datastore';
import { createDialog } from '@/helpers/dialog';

@Component
export default class DefaultLayout extends Vue {
  leftDrawerOpen = true;
  dashboardEditing = false;
  serviceEditing = false;

  created(): void {
    this.leftDrawerOpen = !this.$dense;
    checkDatastore();
  }

  get version(): string {
    return process.env.BLOX_VERSION || 'UNKNOWN';
  }

  get buildDate(): string {
    return process.env.BLOX_DATE || 'UNKNOWN';
  }

  get devMode() {
    return process.env.DEV;
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
  <q-layout view="hHh Lpr fFf">
    <LayoutHeader @menu="leftDrawerOpen = !leftDrawerOpen">
      <template #title>
        <portal-target name="toolbar-title">
          BrewBlox
        </portal-target>
      </template>
      <template #buttons>
        <portal-target name="toolbar-buttons" class="full-height row" />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="leftDrawerOpen" content-class="column" elevated>
      <SidebarNavigator active-section="dashboards" />

      <q-scroll-area class="col" :thumb-style="{opacity: 0.5, background: 'silver'}">
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
        <q-item-section v-if="devMode" class="col-auto">
          <q-btn flat text-color="white" icon="mdi-format-paint" to="/styles">
            <q-tooltip>
              Theming
            </q-tooltip>
          </q-btn>
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
.q-layout
  overflow-x: auto
</style>
