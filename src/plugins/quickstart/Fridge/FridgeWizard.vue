<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardBase from '@/plugins/wizardry/WizardBase';

@Component
export default class FridgeWizard extends WizardBase {
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
  <WizardTaskMaster
    :initial-tasks="initialTasks"
    @back="back"
    @close="close"
  />
</template>
