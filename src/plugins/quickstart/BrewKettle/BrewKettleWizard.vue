<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';

@Component
export default class BrewKettleWizard extends WidgetWizardBase {
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
