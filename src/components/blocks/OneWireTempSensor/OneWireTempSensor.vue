<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/OneWireTempSensor/getters';
import { saveBlock } from '@/store/blocks/actions';
import { OneWireTempSensorBlock } from '@/store/blocks/OneWireTempSensor/OneWireTempSensor';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: '',
      type: String
    }
  }
})
/* eslint-enable */
export default class OneWireTempSensor extends BlockComponent {
  addressInput = '';
  offsetInput = 0;

  get block(): OneWireTempSensorBlock {
    return getById(this.$store, this.$props.id);
  }

  get changed() {
    return (
      this.block.data.address !== this.addressInput ||
      this.block.data.offset.value !== this.offsetInput
    );
  }

  mounted() {
    // set default values
    this.offsetInput = this.block.data.offset.value;
    this.addressInput = this.block.data.address;
  }

  save() {
    this.block.data.offset.value = this.offsetInput;
    this.block.data.address = this.addressInput;

    saveBlock(this.$store, this.block);
  }
}
</script>

<template>
  <q-card>

    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-btn
          :loading="loading"
          icon="check"
          :color="changed ? 'primary' : 'light'"
          :disable="!changed"
          @click="save"
          style="float: right; margin-top: -8px"
        >
          Save
        </q-btn>

        <q-item>
          <q-item-main>
            <q-item-tile label>Value</q-item-tile>
            <q-item-tile sublabel>{{ block.data.value | unit }}</q-item-tile>
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-input
              v-model="offsetInput"
              stack-label="Offset"
              placeholder="Offset of sensor"
              type="number"
              :suffix="block.data.offset.unitNotation"
            />
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-input
              v-model="addressInput"
              stack-label="Address"
              placeholder="Address location of sensor"
            />
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-item-tile label>Connected</q-item-tile>
            <q-item-tile sublabel>{{ block.data.connected }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>
