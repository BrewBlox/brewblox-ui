<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { pluginStore } from '@/store/plugins';

@Component
export default class App extends Vue {

  created(): void {
    pluginStore.setup();
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
