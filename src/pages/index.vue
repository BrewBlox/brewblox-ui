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
import { addBlock, removeBlock } from '../store/blocks/mutations';
import { addSetpoint } from '../store/blocks/setpoints/actions';

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    addNewBlock() {
      addSetpoint(this.$store, { id: '1', value: 666 });
    },
    removeNewBlock() {
      removeBlock(this.$store, '1');
    },
  },
});
</script>
