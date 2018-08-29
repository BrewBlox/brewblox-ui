<script lang="ts">
import Component from 'vue-class-component';

import { saveBlock } from '@/store/blocks/actions';

import BlockComponent from '@/components/BlockComponent';

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
export default class Ticks extends BlockComponent {
  valueInput = 0;

  get block() {
    return getById(this.$store, this.$props.id);
  }

  get millisSinceBoot() {
    return this.block.data.millisSinceBoot;
  }

  get secondsSinceEpoch() {
    return this.block.data.secondsSinceEpoch;
  }
}
</script>

<template>
  <q-card>

    <q-card-title>Ticks ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>

        <q-item>
          <q-item-main>
            <q-item-tile label>Milliseconds since boot</q-item-tile>
            <q-item-tile sublabel>{{ millisSinceBoot }}</q-item-tile>
          </q-item-main>
        </q-item>

        <q-item>
          <q-item-main>
            <q-item-tile label>Seconds since 1 jan 1970</q-item-tile>
            <q-item-tile sublabel>{{ secondsSinceEpoch }}</q-item-tile>
          </q-item-main>
        </q-item>

      </q-list>
    </q-card-main>

  </q-card>
</template>
