<script lang="ts">
import SparkServiceWatcher from './SparkServiceWatcher.vue';
import { SPARK_SERVICE_TYPE } from '@/plugins/spark/const';
import { SparkService } from '@/plugins/spark/types';
import { useServiceStore } from '@/store/services';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'SparkWatcher',
  components: {
    SparkServiceWatcher,
  },
  setup() {
    const serviceStore = useServiceStore();
    const services = computed<SparkService[]>(() =>
      serviceStore.services.filter(
        (service) => service.type === SPARK_SERVICE_TYPE,
      ),
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
