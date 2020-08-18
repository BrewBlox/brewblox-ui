<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardBase from '@/plugins/wizardry/WizardBase';

@Component
export default class RimsWizard extends WizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'QuickStartDiscoveryTask',
    'RimsNamingTask',
    'RimsHardwareTask',
    'RimsManualTask',
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
