<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';


@Component
export default class Navigator extends Vue {

  // env flag
  automationFeatureEnabled = !!process.env.BLOX_FEATURE_AUTOMATION;

  @Prop({ type: String, required: false })
  public readonly activeSection!: string;

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

  showAutomationEditor(): void {
    createDialog({
      parent: this,
      component: 'AutomationEditor',
    });
  }
}
</script>

<template>
  <div class="col-auto">
    <ActionItem icon="mdi-home" label="BrewBlox" to="/" exact />
    <q-separator />

    <div class="row wrap">
      <q-btn
        icon="mdi-view-dashboard"
        label="Dashboards"
        to="/"
        :color="activeSection === 'dashboards' ? 'primary' : ''"
        stack
        flat
        class="col-auto q-py-sm"
        no-caps
      />
      <q-btn
        v-if="!editorDisabled"
        icon="mdi-tools"
        label="Builder"
        to="/builder"
        :color="activeSection === 'builder' ? 'primary' : ''"
        stack
        flat
        no-caps
        class="col-auto q-py-sm"
      />
      <q-btn
        icon="mdi-creation"
        label="Wizardry"
        stack
        flat
        no-caps
        class="col-auto q-py-sm"
        @click="showWizard"
      />
      <q-btn
        v-if="automationFeatureEnabled"
        icon="mdi-calendar-check"
        label="Automation"
        stack
        flat
        class="col-auto q-py-sm"
        no-caps
        @click="showAutomationEditor"
      />
    </div>
    <q-separator />
  </div>
</template>
