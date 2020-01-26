<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class App extends Vue {

  async created(): Promise<void> {
    /**
     * Order of startup is important here.
     * Startup functions may register eventbus listeners.
     * If they do so after the eventbus started,
     * they will miss the first (immediate) data push.
     */
    await Vue.$startup.start();
    await Vue.$eventbus.start();
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
