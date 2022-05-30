<script lang="ts">
import { computed, defineComponent } from 'vue';

import { WatcherFeature, useFeatureStore } from '@/store/features';

export default defineComponent({
  name: 'WatcherContainer',
  setup() {
    const featureStore = useFeatureStore();
    const watchers = computed<WatcherFeature[]>(() => featureStore.watchers);

    return {
      watchers,
    };
  },
});
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
