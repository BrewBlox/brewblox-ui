<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue { }
</script>

<template>
  <div class="toolbar-size">
    <q-bar class="bg-secondary text-white q-pr-none dialog-toolbar toolbar-size">
      <slot />
      <q-space />
      <slot name="buttons" />
      <q-btn v-close-popup flat stretch icon="mdi-close-circle" size="md" @click="$emit('close')" />
    </q-bar>
  </div>
</template>

<style scoped>
.toolbar-size {
  height: 50px;
  min-height: 50px;
  width: 100%;
  min-width: 100%;
}
</style>
