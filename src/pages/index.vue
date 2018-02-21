<template>
  <q-page class="flex flex-center">
    <q-btn @click="findBlock">Add</q-btn>
    <q-btn @click="removeNewBlock">Remove</q-btn>
  </q-page>
</template>

<style>
</style>

<script lang="ts">
import Vue from 'vue';
import { findBlock } from '../store/blocks/actions';

export default Vue.extend({
  name: 'PageIndex',
  methods: {
    findBlock() {
      findBlock('1');
    },
    removeNewBlock() { },
  },
});
</script>
