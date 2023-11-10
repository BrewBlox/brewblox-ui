<script setup lang="ts">
import { computed } from 'vue';
import { useFeatureStore, WatcherFeature } from '@/store/features';

const featureStore = useFeatureStore();
const watchers = computed<WatcherFeature[]>(() => featureStore.watchers);
</script>

<template>
  <div style="height: 0; width: 0; overflow: hidden">
    <component
      :is="watcher.component"
      v-for="watcher in watchers"
      :key="watcher.id"
      v-bind="watcher.props"
    />
  </div>
</template>
