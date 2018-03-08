<template>
  <q-page class="flex flex-center">
    <q-btn @click="updateBlock">UPDATE BLOCK</q-btn>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';
import { persist as persistSensorSetPointPair } from '../store/blocks/SensorSetPointPair/actions';

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    updateBlock() {
      persistSensorSetPointPair({
        id: 'controller-1/sensor-setpoint-pair-1',
        links: {
          sensor: 'sensor',
          setpoint: 'setpoint',
        },
      });
    },
  },
});
</script>
