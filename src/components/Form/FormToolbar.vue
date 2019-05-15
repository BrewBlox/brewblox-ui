<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

@Component
export default class FormToolbar extends Vue { }
</script>

<template>
  <q-bar class="row items-center bg-primary q-py-lg text-white">
    <slot/>
    <q-space/>
    <slot name="buttons"/>
    <q-btn v-close-popup flat rounded label="close"/>
  </q-bar>
</template>

