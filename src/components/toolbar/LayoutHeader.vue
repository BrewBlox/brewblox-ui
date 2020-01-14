<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class LayoutHeader extends Vue {

}
</script>

<template>
  <q-header class="glossy bg-dark">
    <q-toolbar>
      <q-btn flat dense round icon="menu" @click="$emit('menu')" />
      <q-toolbar-title class="col text-center">
        <slot name="title" />
      </q-toolbar-title>
      <slot name="buttons" />
    </q-toolbar>
  </q-header>
</template>
