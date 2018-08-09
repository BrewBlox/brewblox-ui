<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/OneWireTempSensor/getters';
import { persist } from '@/store/blocks/OneWireTempSensor/actions';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: '',
      type: String,
    },
  },
})
/* eslint-enable */
export default class OneWireTempSensor extends BlockComponent {
  addressInput = '';
  offsetInput = 0;

  get blockData() {
    return getById(this.$store, this.$props.id);
  }

  get settings() {
    return this.blockData.settings;
  }

  get state() {
    return this.blockData.state;
  }

  get loading() {
    return !!this.blockData.isLoading;
  }

  get changed() {
    return this.settings.address !== this.addressInput ||
      this.settings.offset.value !== this.offsetInput;
  }

  mounted() {
    // set default values
    this.offsetInput = this.settings.offset.value;
    this.addressInput = this.settings.address;
  }

  save() {
    // update offset's value
    this.settings.offset.value = this.offsetInput;

    persist(this.$store, {
      settings: {
        offset: this.settings.offset,
        address: this.addressInput,
      },
      id: this.blockData.id,
      serviceId: this.blockData.serviceId,
    });
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

        <q-list-header>Settings</q-list-header>
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
            <q-input
              v-model="offsetInput"
              stack-label="Offset"
              placeholder="Offset of sensor"
              type="number"
              :suffix="settings.offset.unitNotation"
            />
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>

    <q-card-separator />

    <q-card-main>
      <q-list>
        <q-list-header>State</q-list-header>
        <q-item>
          <q-item-main>
            <q-item-tile label>Value</q-item-tile>
            <q-item-tile sublabel>{{ state.value | unit }}</q-item-tile>
          </q-item-main>
        </q-item>
        <q-item>
          <q-item-main>
            <q-item-tile label>Connected</q-item-tile>
            <q-item-tile sublabel>{{ state.connected }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>
