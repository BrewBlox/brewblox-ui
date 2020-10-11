<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';

@Component
export default class FermentWizard extends WidgetWizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'FermentNamingTask',
    'FermentHardwareTask',
    'FermentSettingsTask',
    'FermentManualTask',
  ];
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
