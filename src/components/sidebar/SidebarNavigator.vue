<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

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

  @Prop({ type: String, required: false })
  public readonly activeSection!: string;

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
      parent: this, // Wizards may require access to router
      activeDashboardId: this.currentDashboard,
    });
  }

  btnColor(section: string): string {
    return this.activeSection === section ? 'primary' : '';
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
        :color="btnColor('dashboards')"
        v-bind="btnAttrs"
      />
      <q-btn
        icon="mdi-pipe"
        label="Brewery"
        to="/brewery"
        :color="btnColor('brewery')"
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
        v-if="automationAvailable"
        icon="mdi-calendar-check"
        label="Automation"
        to="/automation"
        :color="btnColor('automation')"
        v-bind="btnAttrs"
      />
      <q-btn
        v-if="!editorDisabled"
        icon="mdi-tools"
        label="Builder"
        to="/builder"
        :color="btnColor('builder')"
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
