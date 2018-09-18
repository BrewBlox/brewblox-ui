<script lang="ts">
import Component, { mixins } from 'vue-class-component';

import BlockToolbar from '@/components/WidgetGenerics/BlockToolbar.vue';
import BlockWidget from '../BlockWidget';
import { TicksBlock } from './state';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    BlockToolbar,
  },
})
/* eslint-enable */
export default class SensorSetPointPairWidget extends BlockWidget {
  get block(): TicksBlock {
    return getById(this.$store, this.blockId);
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
      <q-card-main>
        <q-list>

          <q-item class="grid-items-2">

            <q-item-side>
              <q-item-tile sublabel>Time since boot</q-item-tile>
              <q-item-tile
                label
                class="q-headline"
              >
                {{ block.data.millisSinceBoot }} ms
              </q-item-tile>
            </q-item-side>

            <q-item-side>
              <q-item-tile sublabel>Time since Epoch</q-item-tile>
              <q-item-tile
                label
                class="q-headline"
              >
                {{ block.data.secondsSinceEpoch }} s
              </q-item-tile>
            </q-item-side>

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
