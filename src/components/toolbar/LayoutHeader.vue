<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class LayoutHeader extends Vue {

}
</script>

<template>
  <q-header class="glossy bg-dark">
    <q-bar class="bg-transparent q-px-none">
      <q-btn flat stretch icon="menu" @click="$emit('menu')" />
      <q-btn flat stretch no-caps label="BrewBlox" to="/" />
      <q-toolbar-title class="col text-center">
        <slot name="title" />
      </q-toolbar-title>
      <slot name="buttons" />
    </q-bar>
  </q-header>
</template>
