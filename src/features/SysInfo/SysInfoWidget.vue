<script lang="ts">
import Component, { mixins } from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';

import { SysInfoBlock } from './state';
import { getById } from './getters';


@Component
export default class SensorSetPointPairWidget extends mixins(BlockWidget) {
  get block(): SysInfoBlock {
    return getById(this.$store, this.blockId);
  }
}
</script>

<template>
  <div>
    <q-toolbar color="dark-bright">
      <q-toolbar-title>
        {{ block.serviceId }}/{{ block.id }}
        <q-item-tile sublabel>{{ block.type }}</q-item-tile>
      </q-toolbar-title>
    </q-toolbar>

    <q-card>
      <q-card-main>
        <q-list>

          <q-item class="grid-items-2">
            <q-item-main>
              <q-item-tile sublabel>Device ID</q-item-tile>
              <q-item-tile label class="q-headline">
                {{ block.data.deviceId }}
              </q-item-tile>
            </q-item-main>
          </q-item>

        </q-list>
      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-list {
  border: 0;
}

.q-item {
  display: grid;
  grid-gap: 10px;
}

.grid-items-2 {
  grid-template-columns: 1fr 1fr;
}
</style>
