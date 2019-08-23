<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

@Component
export default class FermentWizard extends WidgetWizardBase {
  get initialTasks() {
    return [
      'FermentNamingTask',
      'FermentHardwareTask',
      'FermentSettingsTask',
      'FermentManualTask',
    ].reverse();
  }
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
