<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardBase from '@/plugins/wizardry/WizardBase';

@Component
export default class GlycolWizard extends WizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'QuickStartDiscoveryTask',
    'GlycolNamingTask',
    'GlycolHardwareTask',
    'GlycolSettingsTask',
    'GlycolManualTask',
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
