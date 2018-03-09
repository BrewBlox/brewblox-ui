<template>
  <q-page padding>
    <Metrics id="controller-1/sensor-1" />
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';

import Metrics from '../components/metrics/metrics.vue';

export default Vue.extend({
  name: 'PageIndex',
  components: { Metrics },
  methods: {},
});
</script>
