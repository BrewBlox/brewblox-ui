<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { displayNameByType } from '@/features/feature-by-type';

/* eslint-disable indent */
@Component({
  props: {
    block: {
      type: Object,
      default: () => { throw new Error('Provide Block'); },
    },
    onRefresh: {
      type: Function,
      default: (blockId: string) => { },
    },
    onSettings: {
      type: Function,
      default: (blockId: string) => { },
    },
  },
})
/* eslint-enable */
export default class BlockToolbar extends Vue {
  get displayName(): string {
    return displayNameByType(this.$props.block.type);
  }
}
</script>

<template>
  <q-toolbar color="dark-bright">
    <q-toolbar-title>
      {{ $props.block.serviceId }}/{{ $props.block.id }}
      <q-item-tile sublabel>{{ displayName }}</q-item-tile>
    </q-toolbar-title>

    <slot />

    <q-btn
      flat
      round
      dense
      icon="settings"
      @click="$props.onSettings"
    />

    <q-btn
      flat
      round
      dense
      icon="refresh"
      @click="$props.onRefresh"
    />
  </q-toolbar>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
