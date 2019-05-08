<script lang="ts">
import dashboardStore from '@/store/dashboards';
import serviceStore from '@/store/services';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class App extends Vue {
  async created() {
    await Promise.all([
      serviceStore.setup(),
      dashboardStore.setup(),
    ]);
  }
}
</script>

<template>
  <div id="q-app">
    <router-view/>
  </div>
</template>

<style lang="stylus">
// We import global styling here
@import './styles/quasar.styl';
</style>
