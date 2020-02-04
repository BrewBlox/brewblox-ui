<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue {

}
</script>

<template>
  <Toolbar class="q-pa-none" v-bind="$attrs">
    <slot />
    <template #buttons>
      <slot name="buttons" />
      <q-btn v-close-popup flat round dense icon="mdi-close-circle" @click="$emit('close')" />
    </template>
  </Toolbar>
</template>
