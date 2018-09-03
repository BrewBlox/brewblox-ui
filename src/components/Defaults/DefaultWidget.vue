<script lang="ts">
import Component, { mixins } from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget';

import { blockById } from '@/store/blocks/getters';

/* eslint-disable indent */
@Component({
  filters: {
    pretty: (val: any) => JSON.stringify(val, null, 2),
  }
})
/* eslint-enable */
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
        <q-item-tile sublabel>{{ block.type }}</q-item-tile>
        <pre>{{ block.data | pretty }}</pre>
      </q-item>
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
