<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { fetchBlocks } from './store/blocks/actions';
import { fetchDashboards } from './store/dashboards/actions';

export default {
  name: 'App',
  async created() {
    // fetch all block and dashboard on init
    await Promise.all([
      fetchBlocks(),
      // @ts-ignore
      fetchDashboards(this.$store),
    ]);
  },
};
</script>

<style>
</style>
