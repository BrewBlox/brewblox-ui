<script lang="ts">
import { defineComponent } from 'vue';

import { sparkType } from '@/plugins/spark/getters';
import { SparkService } from '@/plugins/spark/types';
import { serviceStore } from '@/store/services';

import SparkServiceWatcher from './SparkServiceWatcher.vue';

export default defineComponent({
  name: 'SparkWatcher',
  components: {
    SparkServiceWatcher,
  },
  computed: {
    services(): SparkService[] {
      return serviceStore.services
        .filter(service => service.type === sparkType);
    },
  },
});
</script>

<template>
  <div>
    <SparkServiceWatcher
      v-for="service in services"
      :key="service.id"
      :service="service"
    />
  </div>
</template>
