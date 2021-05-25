<script lang="ts">
import { defineComponent } from 'vue';

import { featureStore } from '@/store/features';

export default defineComponent({
  name: 'Watchers',
  computed: {
    watchers() {
      return featureStore.watchers;
    },
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
