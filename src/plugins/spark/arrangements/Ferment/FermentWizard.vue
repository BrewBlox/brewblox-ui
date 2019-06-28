<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

@Component
export default class FermentWizard extends WidgetWizardBase {
  get initialTasks() {
    return [
      'FermentNamingTask',
    ];
  }
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @close="close"/>
</template>
