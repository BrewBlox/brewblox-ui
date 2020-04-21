<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';

@Component
export default class GlycolWizard extends WidgetWizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'GlycolNamingTask',
    'GlycolHardwareTask',
    'GlycolSettingsTask',
    'GlycolManualTask',
  ];
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
