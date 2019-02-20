<script lang="ts">
import WizardBase from '@/components/Wizard/WizardBase';
import Component from 'vue-class-component';

@Component
export default class BrewPiConfigurationWizard extends WizardBase {
  get initialTasks() {
    return [
      'BrewPiCfgNamingTask',
      'BrewPiCfgHardwareTask',
      'BrewPiCfgSettingsTask',
    ];
  }
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @close="close"/>
</template>
