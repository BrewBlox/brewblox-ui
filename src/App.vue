<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';

import { stepperStore } from './plugins/stepper/store';

@Component
export default class App extends Vue {
  async created(): Promise<void> {
    await Promise.all([
      serviceStore.setup(),
      dashboardStore.setup(),
      sparkStore.setup(),
      stepperStore.setup(),
    ]);
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<style lang="stylus">
// We import global styling here
@import './styles/quasar.styl';
</style>
