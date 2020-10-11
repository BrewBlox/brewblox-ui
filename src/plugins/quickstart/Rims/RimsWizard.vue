<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';

@Component
export default class RimsWizard extends WidgetWizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'RimsNamingTask',
    'RimsHardwareTask',
    'RimsManualTask',
  ];
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
