<script setup lang="ts">
import { computed } from 'vue';
import { SPARK_SERVICE_TYPE } from '@/plugins/spark/const';
import { SparkService } from '@/plugins/spark/types';
import { useServiceStore } from '@/store/services';
import SparkServiceWatcher from './SparkServiceWatcher.vue';

const serviceStore = useServiceStore();

const services = computed<SparkService[]>(() =>
  serviceStore.services.filter(
    (service) => service.type === SPARK_SERVICE_TYPE,
  ),
);
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
