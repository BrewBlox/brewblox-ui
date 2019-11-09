<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import buildEnv from '@/build-env.json';
import { checkDatastore } from '@/helpers/datastore';
import { createDialog } from '@/helpers/dialog';

@Component
export default class DefaultLayout extends Vue {
  leftDrawerOpen = true;
  dashboardEditing = false;
  serviceEditing = false;

  created(): void {
    checkDatastore();
  }

  // env flag
  stepperFeatureEnabled = process.env.VUE_APP_STEPPER_FEATURE === 'true';

  get version(): string {
    return buildEnv.version || 'UNKNOWN';
  }

  get buildDate(): string {
    return buildEnv.date || 'UNKNOWN';
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

  showBuilderEditor(): void {
    createDialog({
      parent: this,
      component: 'BuilderEditor',
    });
  }

  showStepperEditor(): void {
    createDialog({
      parent: this,
      component: 'StepperEditor',
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
    <q-header class="glossy bg-dark">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>
          <portal-target name="toolbar-title">
            BrewBlox
          </portal-target>
        </q-toolbar-title>
        <portal-target name="toolbar-buttons" class="toolbar-buttons" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" content-class="bg-dark" elevated>
      <q-item dark exact to="/">
        <q-item-section avatar>
          <q-icon name="mdi-home" />
        </q-item-section>
        <q-item-section>BrewBlox</q-item-section>
      </q-item>

      <q-separator dark />
      <DashboardIndex v-model="dashboardEditing" />
      <ServiceIndex v-model="serviceEditing" />

      <q-separator dark class="q-mt-sm" />
      <ActionItem icon="mdi-creation" label="Wizardry" @click="showWizard" />
      <ActionItem icon="mdi-pipe" label="Brewery Builder" @click="showBuilderEditor" />
      <template v-if="stepperFeatureEnabled">
        <ActionItem icon="mdi-calendar-check" label="Stepper" @click="showStepperEditor" />
      </template>

      <q-item dark class="bottomed">
        <q-item-section class="col-auto">
          <q-btn flat text-color="white" icon="mdi-puzzle" @click="showPlugins">
            <q-tooltip>
              Plugins
            </q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn-dropdown flat text-color="white" icon="mdi-bug-outline">
            <q-list dark bordered>
              <q-item dark>
                <q-item-section>
                  <q-item-label caption>
                    Version
                  </q-item-label>
                  {{ version }}
                </q-item-section>
              </q-item>
              <q-item dark>
                <q-item-section>
                  <q-item-label caption>
                    Build date
                  </q-item-label>
                  {{ buildDate }}
                </q-item-section>
              </q-item>
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

<style scoped>
.bottomed {
  bottom: 0;
  position: absolute;
}
.q-layout {
  overflow-x: auto;
}
</style>
