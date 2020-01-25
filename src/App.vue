<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { pluginStore } from '@/store/plugins';

@Component
export default class App extends Vue {

  async created(): Promise<void> {
    await pluginStore.setup();
    await Vue.$eventbus.start();
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
