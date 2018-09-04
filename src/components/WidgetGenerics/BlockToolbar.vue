<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';

/* eslint-disable indent */
@Component({
  props: {
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
export default class BlockToolbar extends BlockWidget {
  onSettings() {
    this.$props.onSettings(this.block.id);
  }

  onRefresh() {
    this.$props.onRefresh(this.block.id);
  }
}
</script>

<template>
  <q-toolbar color="dark-bright">
    <q-toolbar-title>
      {{ block.serviceId }}/{{ block.id }}
      <q-item-tile sublabel>{{ displayName }}</q-item-tile>
    </q-toolbar-title>

    <slot />

    <q-btn
      flat
      round
      dense
      icon="settings"
      @click="onSettings"
    />

    <q-btn
      flat
      round
      dense
      icon="refresh"
      @click="onRefresh"
    />
  </q-toolbar>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
