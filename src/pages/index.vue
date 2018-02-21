<template>
  <q-page class="flex flex-center">
    <q-btn @click="addNewBlock">Add</q-btn>
    <q-btn @click="removeNewBlock">Remove</q-btn>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';
import { addSetPoint } from '../store/blocks/setpoints/actions';

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    addNewBlock() {
      addSetPoint({ id: +new Date(), value: 666 });
    },
    removeNewBlock() { },
  },
});
</script>
