<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';


@Component
export default class SidebarNavigator extends Vue {
  btnAttrs = {
    stack: true,
    flat: true,
    noCaps: true,
    class: 'col-grow q-py-sm max-small',
  }

  // Set in quasar.conf
  automationFeatureEnabled = !!process.env.BLOX_FEATURE_AUTOMATION;

  @Prop({ type: String, required: false })
  public readonly activeSection!: string;

  get editorDisabled(): boolean {
    const { ie, edge } = this.$q.platform.is;
    return Boolean(ie || edge) || this.$dense;
  }

  showWizard(): void {
    createDialog({
      parent: this,
      component: 'WizardDialog',
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
        v-if="automationFeatureEnabled"
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
