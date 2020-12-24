<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { automationStore } from '@/plugins/automation/store';


@Component
export default class SidebarNavigator extends Vue {
  btnAttrs = {
    stack: true,
    flat: true,
    noCaps: true,
    class: 'col-grow q-py-sm max-small',
  }

  get activeSection(): string {
    return this.$route.path.split('/')[1] ?? '';
  }

  get editorDisabled(): boolean {
    return this.$q.platform.is.ie || this.$dense;
  }

  get automationAvailable(): boolean {
    return automationStore.available;
  }

  get currentDashboard(): string | null {
    return this.$route.path.startsWith('/dashboard')
      ? this.$route.params.id
      : null;
  }

  showWizard(): void {
    createDialog({
      component: 'WizardDialog',
      activeDashboardId: this.currentDashboard,
    });
  }

  btnColor(...sections: string[]): string {
    return sections.includes(this.activeSection) ? 'primary' : '';
  }
}
</script>

<template>
  <div class="col-auto">
    <div class="row wrap">
      <q-btn
        icon="mdi-view-dashboard"
        label="Dashboards"
        to="/"
        :color="btnColor('dashboard', 'service', 'brewery')"
        v-bind="btnAttrs"
      />
      <q-btn
        icon="mdi-settings"
        label="Settings"
        to="/config"
        :color="btnColor('config')"
        v-bind="btnAttrs"
      />
      <q-btn
        icon="mdi-creation"
        label="Wizardry"
        v-bind="btnAttrs"
        @click="showWizard"
      />
      <div class="col-break" />
      <q-btn
        v-if="!editorDisabled"
        icon="mdi-tools"
        label="Builder"
        to="/builder"
        :color="btnColor('builder')"
        v-bind="btnAttrs"
      />
      <q-btn
        v-if="automationAvailable"
        icon="mdi-calendar-check"
        label="Automation"
        to="/automation"
        :color="btnColor('automation')"
        v-bind="btnAttrs"
      />
    </div>
    <q-separator />
  </div>
</template>

<style lang="sass" scoped>
.max-small
  max-width: 34%
</style>
