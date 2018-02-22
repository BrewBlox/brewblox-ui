<template>
  <q-page class="flex flex-center">
    <q-btn @click="findBlock">FIND BLOCK</q-btn>
    <q-btn @click="updateBlock">UPDATE BLOCK</q-btn>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';
import { findBlock, updateBlock } from '../store/blocks/actions';

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    findBlock() {
      findBlock('1');
    },
    updateBlock() {
      updateBlock({
        id: 'setpoint-1',
        setting: 20,
      });
    },
  },
});
</script>
