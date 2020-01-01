<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { checkDatastore } from '@/helpers/datastore';
import { createDialog } from '@/helpers/dialog';

@Component
export default class DefaultLayout extends Vue {
  leftDrawerOpen = !this.dense;
  dashboardEditing = false;
  serviceEditing = false;

  created(): void {
    checkDatastore();
  }

  // env flag
  automationFeatureEnabled = !!process.env.BLOX_FEATURE_AUTOMATION;

  get version(): string {
    return process.env.BLOX_VERSION || 'UNKNOWN';
  }

  get buildDate(): string {
    return process.env.BLOX_DATE || 'UNKNOWN';
  }

  get dense(): boolean {
    return this.$q.screen.lt.md;
  }

  get editorDisabled(): boolean {
    const { ie, edge } = this.$q.platform.is;
    return Boolean(ie || edge) || this.dense;
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

  showAutomationEditor(): void {
    createDialog({
      parent: this,
      component: 'AutomationEditor',
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
      <div class="col-auto">
        <ActionItem to="/" exact icon="mdi-home" label="BrewBlox" />
        <ActionItem v-if="!editorDisabled" to="/builder" icon="mdi-pipe" label="Brewery Builder" />
        <q-separator />
      </div>

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <DashboardIndex v-model="dashboardEditing" />
        <ServiceIndex v-model="serviceEditing" />

        <q-separator class="q-mt-sm" />
        <ActionItem icon="mdi-creation" label="Wizardry" @click="showWizard" />
        <template v-if="automationFeatureEnabled">
          <ActionItem icon="mdi-calendar-check" label="Automation" @click="showAutomationEditor" />
        </template>
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
