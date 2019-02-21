<script lang="ts">
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';


@Component
export default class BrewPiHardwareTask extends WizardTaskBase {
  mounted() {
    console.log('hardware');
    this.finish();
  }
}
</script>

<template>
  <div/>
</template>
