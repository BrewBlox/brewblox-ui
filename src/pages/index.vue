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

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    addNewBlock() {
      addBlock(this.$store, { id: '1', type: 'test' });
    },
    removeNewBlock() {
      removeBlock(this.$store, '1');
    },
  },
});
</script>
