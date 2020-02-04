<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';


@Component
export default class LayoutHeader extends Vue {

}
</script>

<template>
  <q-header class="bg-dark shadow-1">
    <q-bar class="bg-transparent q-px-none">
      <q-btn flat round icon="menu" style="font-size: 80%" @click="$emit('menu')" />
      <div v-if="!$dense" class="col-auto" style="font-weight: 500; font-size: 110%">
        <slot name="title" />
      </div>
      <q-btn flat rounded to="/" class="absolute-center">
        <img v-if="$dense" src="~assets/logo-x.svg" style="height: 30px" class="q-py-xs">
        <img v-else src="~assets/logo-wordmark-dark.svg" style="height: 30px" class="q-py-xs">
      </q-btn>
      <q-space />
      <slot name="buttons" />
    </q-bar>
  </q-header>
</template>
