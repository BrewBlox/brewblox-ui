<script lang="ts">
import Component, { mixins } from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';

import { blockById } from '@/store/blocks/getters';

@Component
export default class DefaultWidget extends mixins(BlockWidget) {
  refreshState() {
    return undefined;
  }
}
</script>

<template>
  <div>

    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
        <q-item-tile sublabel>{{ displayName }}</q-item-tile>
      </q-toolbar-title>
      <q-btn
        flat
        round
        dense
        icon="refresh"
        @click="refreshState"
      />
    </q-toolbar>

    <q-card>
      <q-item>
        <pre>{{ block.data }}</pre>
      </q-item>
    </q-card>

  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}
</style>
