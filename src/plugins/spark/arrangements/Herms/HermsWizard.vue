<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

@Component
export default class HermsWizard extends WidgetWizardBase {
  get initialTasks() {
    return [
      'HermsNamingTask',
      'HermsHardwareTask',
      'HermsSettingsTask',
      'HermsManualTask',
    ].reverse();
  }
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
