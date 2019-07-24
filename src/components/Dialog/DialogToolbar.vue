<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue { }
</script>

<template>
  <q-bar class="row items-center bg-primary q-py-lg text-white" style="max-width: 100%">
    <slot />
    <q-space />
    <slot name="buttons" />
    <q-btn v-close-popup flat label="close" @click="$emit('close')" />
  </q-bar>
</template>
