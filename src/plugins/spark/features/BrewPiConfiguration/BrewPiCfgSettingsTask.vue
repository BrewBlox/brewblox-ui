<script lang="ts">
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';


@Component
export default class BrewPiCfgSettingsTask extends WizardTaskBase {
  mounted() {
    console.log('settings');
    this.finish();
  }
}
</script>

<template>
  <div/>
</template>
