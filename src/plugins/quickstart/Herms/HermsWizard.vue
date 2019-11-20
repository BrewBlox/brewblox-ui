<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/WidgetWizardBase';

@Component
export default class HermsWizard extends WidgetWizardBase {
  initialTasks = [
    'HermsNamingTask',
    'HermsHardwareTask',
    'HermsMutexTask',
    'HermsSettingsTask',
    'HermsManualTask',
  ];
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
