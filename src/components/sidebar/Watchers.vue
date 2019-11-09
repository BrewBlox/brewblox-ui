<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { featureStore, Watcher } from '@/store/features';

@Component
export default class Watchers extends Vue {
  get watchers(): Watcher[] {
    return featureStore.watchers;
  }
}
</script>

<template>
  <div style="height: 0px; width: 0px;">
    <component
      :is="watcher.component"
      v-for="(watcher, idx) in watchers"
      :key="'watcher'+idx"
      v-bind="watcher.props"
    />
  </div>
</template>
