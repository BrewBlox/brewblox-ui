<template>
  <q-page padding>
    <q-inner-loading :visible="fetching">
      <q-spinner
        size="50px"
        color="primary"
      />
    </q-inner-loading>

    <template v-if="!fetching">
      <Metrics id="controller-1/sensor-1" />
    </template>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';

import Metrics from '@/components/metrics/Metrics.vue';

import { isFetching } from '@/store/blocks/getters';

export default Vue.extend({
  name: 'PageIndex',
  components: { Metrics },
  computed: {
    fetching(): boolean {
      return isFetching(this.$store);
    },
  },
  methods: {},
});
</script>
