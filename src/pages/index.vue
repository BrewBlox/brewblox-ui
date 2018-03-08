<template>
  <q-page class="flex flex-center">
    <q-btn @click="updateBlock">UPDATE BLOCK</q-btn>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';
import { persistSensorSetPointPair } from '../store/blocks/SensorSetPointPair/actions';

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    updateBlock() {
      persistSensorSetPointPair({
        id: 'controller-1/setpoint-1',
        settings: {
          value: 20,
        },
      });
    },
  },
});
</script>
