<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/store/blocks/actions';

import BlockWidget from '@/components/BlockWidget';
import ProfilesBar from '@/components/ProfilesBar/ProfilesBar.vue';

import { OneWireTempSensorBlock } from './state';
import { getById } from './getters';

/* eslint-disable indent */
@Component({
  components: {
    ProfilesBar
  }
})
/* eslint-enable */
export default class OneWireTempSensor extends BlockWidget {
  get block(): OneWireTempSensorBlock {
    return getById(this.$store, this.blockId);
  }

  // get changed() {
  //   return (
  //     this.block.data.address !== this.addressInput ||
  //     this.block.data.offset.value !== this.offsetInput
  //   );
  // }

  // mounted() {
  //   // set default values
  //   this.offsetInput = this.block.data.offset.value;
  //   this.addressInput = this.block.data.address;
  // }

  // save() {
  //   this.block.data.offset.value = this.offsetInput;
  //   this.block.data.address = this.addressInput;

  //   saveBlock(this.$store, this.block);
  // }
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

    TODO
    <!-- <q-card>
      <q-card-main>
        <q-list>
          <q-item class="grid-items-2">
            <q-item-tile sublabel>Address</q-item-tile>
            <q-item-tile
              label
              class="q-headline"
            >
              {{ block.data.address }}
            </q-item-tile>
          </q-item>

          <q-item class="grid-items-2">
            <q-item-main>
              <q-item-tile sublabel>Value</q-item-tile>
              <q-input
                v-model="block.data.value"
                type="number"
                :suffix="block.data.value.unitNotation"
                numeric-keyboard-toggle
              />
            </q-item-main>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card> -->

  </div>
  <!-- <q-card>

    <q-card-title>OneWireTempSensor ({{ id }})</q-card-title>
    <profiles-bar :id="id"/>

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
  </q-card> -->
</template>
