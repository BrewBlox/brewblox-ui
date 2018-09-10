<script lang="ts">
import Component from 'vue-class-component';

import BlockWidget from '@/components/BlockWidget/BlockWidget';
import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';

import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    BlockToolbar,
  },
})
/* eslint-enable */
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

    <block-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

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
