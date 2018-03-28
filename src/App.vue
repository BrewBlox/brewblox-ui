<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { listBlocks } from './store/blocks/actions';
import { listDashboards } from './store/dashboards/actions';

export default {
  name: 'App',
  created() {
    listBlocks();
    listDashboards();
  },
};
</script>

<style>
</style>
