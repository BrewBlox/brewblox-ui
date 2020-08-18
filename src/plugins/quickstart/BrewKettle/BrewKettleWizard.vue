<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardBase from '@/plugins/wizardry/WizardBase';

@Component
export default class BrewKettleWizard extends WizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'QuickStartDiscoveryTask',
    'BrewKettleNamingTask',
    'BrewKettleHardwareTask',
    'BrewKettleSettingsTask',
    'BrewKettleManualTask',
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
