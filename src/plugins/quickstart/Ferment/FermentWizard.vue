<script lang="ts">
import { Component } from 'vue-property-decorator';

import WizardBase from '@/components/WizardBase';

@Component
export default class FermentWizard extends WizardBase {
  initialTasks = [
    'QuickStartServiceTask',
    'QuickStartDiscoveryTask',
    'FermentNamingTask',
    'FermentHardwareTask',
    'FermentSettingsTask',
    'FermentManualTask',
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
