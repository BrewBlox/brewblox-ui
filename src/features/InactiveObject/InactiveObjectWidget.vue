<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';

import { getById } from './getters';

@Component
export default class InactiveObjectWidget extends BlockWidget {
  refreshState() {
    return undefined;
  }

  get block() {
    return getById(this.$store, this.blockId);
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
        <q-list-header>This block is not in any active profile</q-list-header>
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
