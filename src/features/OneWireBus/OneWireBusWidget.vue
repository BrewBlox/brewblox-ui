<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';

import { getById } from './getters';

@Component
export default class OneWireBusWidget extends BlockWidget {
  get block() {
    return getById(this.$store, this.blockId);
  }

  refreshState() {

  }

  scan() {

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

      <q-card-actions align="end">
        <q-btn
          icon="autorenew"
          color="primary"
          @click="scan"
        >
          Scan for devices
        </q-btn>
      </q-card-actions>

    </q-card>

  </div>
</template>

<style scoped>
.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}

.grid-items-3 {
  grid-template-columns: 1fr 1fr 1fr;
}

.q-item-side {
  text-align: center;
  margin-left: 0;
}

.q-item-section {
  margin-left: 0;
}

.modal .q-list {
  border: 0;
}
</style>
