<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/services/spark/store/actions';
import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import BlockWidget from '@/services/spark/components/BlockWidget';
import { OneWireTempSensorBlock } from './state';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    WidgetToolbar,
  },
})
/* eslint-enable */
export default class OneWireTempSensor extends BlockWidget {
  inputMapping = {
    address: { path: 'block.data.address', default: '' },
    offset: { path: 'block.data.offset.value', default: 0 },
  };

  get block(): OneWireTempSensorBlock {
    return getById(this.$store, this.blockId);
  }
}
</script>

<template>
  <div>

    <widget-toolbar
      :name="$props.id"
      :type="$props.type"
      :on-refresh="refreshBlock"
    />

    <q-card>
      <q-card-main>
        <q-list>

          <q-item class="grid-items-2">

            <q-item-main>
              <q-item-tile sublabel>Address</q-item-tile>
              <q-input
                v-model="inputs.address"
                type="text"
              />
            </q-item-main>

            <q-item-main>
              <q-item-tile sublabel>Connection status</q-item-tile>
              <q-item-tile
                :icon="block.data.connected ? 'link' : 'link_off'"
              >
              </q-item-tile>
            </q-item-main>

          </q-item>

          <q-item-separator />
          <q-item class="grid-items-2">

            <q-item-main>
              <q-item-tile sublabel>Value</q-item-tile>
              <q-item-tile label class="q-headline">
                {{ block.data.value | unit }}
              </q-item-tile>
            </q-item-main>

            <q-item-main>
              <q-item-tile sublabel>Offset</q-item-tile>
              <q-input
                v-model="inputs.offset"
                type="number"
                :suffix="block.data.offset.unitNotation"
                numeric-keyboard-toggle
              />
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
