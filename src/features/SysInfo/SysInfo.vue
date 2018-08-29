<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '@/components/BlockComponent';
import { saveBlock } from '@/store/blocks/actions';

import { getById } from './getters';

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
export default class SysInfo extends BlockComponent {
  valueInput = 0;

  get block() {
    return getById(this.$store, this.$props.id);
  }

  get deviceId() {
    return this.block.data.deviceId;
  }
}
</script>

<template>
  <q-card>

    <q-card-title>SysInfo ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>

        <q-item>
          <q-item-main>
            <q-item-tile label>Device ID</q-item-tile>
            <q-item-tile sublabel>{{ deviceId }}</q-item-tile>
          </q-item-main>
        </q-item>

      </q-list>
    </q-card-main>

  </q-card>
</template>
