<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';

@Component
export default class FridgeWizard extends WidgetWizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'QuickStartDiscoveryTask',
    'FridgeNamingTask',
    'FridgeHardwareTask',
    'FridgeSettingsTask',
    'FridgeManualTask',
  ];
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
