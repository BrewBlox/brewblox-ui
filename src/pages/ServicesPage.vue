<script lang="ts">
import SparkServicesView from '@/components/SparkService/SparkServicesView.vue';

export default {
  name: 'ServicesPage',
  components: {
    SparkServicesView,
  },
};
</script>

<template>
  <q-page padding>
    <spark-service-view />
  </q-page>
</template>

<style scoped>
</style>
