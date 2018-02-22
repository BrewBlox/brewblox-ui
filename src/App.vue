<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { listBlocks } from './store/blocks/actions';

export default {
  name: 'App',
  created() {
    listBlocks();
  },
};
</script>

<style>
</style>
