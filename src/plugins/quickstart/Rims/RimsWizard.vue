<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';

@Component
export default class RimsWizard extends WidgetWizardBase {
  initialTasks = [
    'RimsNamingTask',
    'RimsHardwareTask',
    'RimsSettingsTask',
    'RimsManualTask',
  ];
}
</script>

<template>
  <WizardTaskMaster :initial-tasks="initialTasks" @back="back" @close="close" />
</template>
