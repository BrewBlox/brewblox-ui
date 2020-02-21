<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';


@Component
export default class SidebarNavigator extends Vue {

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
}
</script>

<template>
  <div class="col-auto">
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
        to="/automation"
        :color="activeSection === 'automation' ? 'primary' : ''"
        stack
        flat
        no-caps
        class="col-auto q-py-sm"
      />
    </div>
    <q-separator />
  </div>
</template>
