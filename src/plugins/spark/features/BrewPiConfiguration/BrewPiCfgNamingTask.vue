<script lang="ts">
import Component from 'vue-class-component';
import WizardTaskBase from '@/components/Wizard/WizardTaskBase';


@Component
export default class BrewPiCfgNamingTask extends WizardTaskBase {
  mounted() {
    console.log('naming');
    this.finish();
  }
}
</script>

<template>
  <div/>
</template>
