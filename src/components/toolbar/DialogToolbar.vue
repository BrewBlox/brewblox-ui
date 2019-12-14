<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component
export default class DialogToolbar extends Vue { }
</script>

<template>
  <q-bar class="bg-secondary text-white q-pr-none full-width" style="height: 50px; min-height: 50px">
    <slot />
    <q-space />
    <slot name="buttons" />
    <q-btn v-close-popup flat stretch icon="mdi-close-circle" size="md" @click="$emit('close')" />
  </q-bar>
</template>
