<script lang="ts">
import SparkService from '@/services/spark/SparkService.vue';

export default {
  name: 'ServicesPage',
  components: {
    SparkService,
  },
};
</script>

<template>
  <q-page padding>
    <spark-service />
  </q-page>
</template>

<style scoped>
</style>
