<script lang="ts">
import SparkWidget from '@/services/spark/components/SparkWidget.vue';

export default {
  name: 'ServicesPage',
  components: {
    SparkWidget,
  },
};
</script>

<template>
  <q-page padding>
    <spark-widget />
  </q-page>
</template>

<style scoped>
</style>
