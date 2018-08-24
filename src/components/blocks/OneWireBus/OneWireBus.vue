<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/OneWireBus/getters';
import { saveBlock } from '@/store/blocks/actions';

/* eslint-disable indent */
@Component({
  props: {
    id: {
      default: "",
      type: String
    }
  }
})
/* eslint-enable */
export default class OneWireBus extends BlockComponent {
  valueInput = 0;

  get block() {
    return getById(this.$store, this.$props.id);
  }

  get command() {
    return this.block.data.command || { opcode: 0, data: 0 };
  }

  get address() {
    return this.block.data.address;
  }
}
</script>

<template>
  <q-card>
    <q-card-title>OneWireBus ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-list-header>Command</q-list-header>

        <q-item>
          <q-item-main>
            <q-item-tile label>Opcode</q-item-tile>
            <q-item-tile sublabel>{{ command.opcode }}</q-item-tile>
          </q-item-main>
        </q-item>

        <q-item>
          <q-item-main>
            <q-item-tile label>Data</q-item-tile>
            <q-item-tile sublabel>{{ command.data }}</q-item-tile>
          </q-item-main>
        </q-item>

        <q-list-header>Addresses</q-list-header>

        <q-item
          v-for="addr in address"
          :key="addr"
        >
          <q-item-main>
            <q-item-tile label>Bus Address</q-item-tile>
            <q-item-tile sublabel>{{ addr }}</q-item-tile>
          </q-item-main>
        </q-item>

      </q-list>
    </q-card-main>
  </q-card>
</template>
