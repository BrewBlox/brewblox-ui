<script lang="ts">
import WizardBase from '@/components/Wizard/WizardBase';
import Component from 'vue-class-component';

@Component
export default class BrewPiWizard extends WizardBase {
  get initialTasks() {
    return [
      'BrewPiNamingTask',
      'BrewPiHardwareTask',
      'BrewPiSettingsTask',
    ];
  }
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @close="close"/>
</template>
