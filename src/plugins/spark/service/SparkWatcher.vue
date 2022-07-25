<script lang="ts">
import { sparkType } from '@/plugins/spark/const';
import { SparkService } from '@/plugins/spark/types';
import { useServiceStore } from '@/store/services';
import { computed, defineComponent } from 'vue';
import SparkServiceWatcher from './SparkServiceWatcher.vue';

export default defineComponent({
  name: 'SparkWatcher',
  components: {
    SparkServiceWatcher,
  },
  setup() {
    const serviceStore = useServiceStore();
    const services = computed<SparkService[]>(() =>
      serviceStore.services.filter((service) => service.type === sparkType),
    );
    return {
      services,
    };
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
