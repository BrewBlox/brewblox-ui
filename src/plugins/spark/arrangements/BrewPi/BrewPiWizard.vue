<script lang="ts">
import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import Component from 'vue-class-component';

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
