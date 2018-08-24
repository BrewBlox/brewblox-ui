<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/InactiveObject/getters';

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
export default class InactiveObject extends BlockComponent {
  get block() {
    return getById(this.$store, this.$props.id);
  }
}
</script>

<template>
  <q-card>
    <q-card-title>InactiveObject ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>
        <q-item>
          <q-item-main>
            <q-item-tile label>Actual Type</q-item-tile>
            <q-item-tile sublabel>{{ block.data.actual_type }}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>
