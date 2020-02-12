<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { featureStore, WatcherFeature } from '@/store/features';

@Component
export default class Watchers extends Vue {
  get watchers(): Mapped<WatcherFeature> {
    return featureStore.watchers;
  }
}
</script>

<template>
  <div style="height: 0; width: 0; overflow: hidden">
    <component
      :is="watcher.component"
      v-for="(watcher, id) in watchers"
      :key="id"
      v-bind="watcher.props"
    />
  </div>
</template>
