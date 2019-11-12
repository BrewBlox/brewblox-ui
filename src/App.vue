<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { historyStore } from '@/plugins/history/store';
import { sparkStore } from '@/plugins/spark/store';
import { stepperStore } from '@/plugins/stepper/store';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';

@Component
export default class App extends Vue {
  async created(): Promise<void> {
    await Promise.all([
      serviceStore.setup(),
      dashboardStore.setup(),
      historyStore.setup(),
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
@import './styles/quasar.variables.styl';
</style>
