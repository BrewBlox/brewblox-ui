<script lang="ts">
import Component from 'vue-class-component';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

@Component
export default class BrewPiWizard extends WidgetWizardBase {
  get initialTasks() {
    return [
      'BrewPiNamingTask',
    ];
  }
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @close="close"/>
</template>
