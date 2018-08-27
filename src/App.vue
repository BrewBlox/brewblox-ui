<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { fetchServices } from '@/store/services/actions';
import { deviceServices } from '@/store/services/getters';
import { fetchBlocks } from '@/store/blocks/actions';
import { fetchDashboards } from '@/store/dashboards/actions';
import { fetchSettings } from '@/store/settings/actions';

@Component
export default class App extends Vue {
  created() {
    // fetch all block and dashboard on init
    Promise
      .all([
        fetchServices(this.$store),
        fetchDashboards(this.$store),
        fetchSettings(this.$store),
      ])
      .then(() => deviceServices(this.$store)
        .forEach(service => fetchBlocks(this.$store, service)))
      .catch((e) => { throw new Error(e); });
  }
}
</script>

<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<style>
</style>
