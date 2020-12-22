<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardBase from '@/plugins/wizardry/WizardBase';

@Component
export default class HermsWizard extends WizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'QuickStartDiscoveryTask',
    'HermsNamingTask',
    'HermsHardwareTask',
    'HermsMutexTask',
    'HermsSettingsTask',
    'HermsManualTask',
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
