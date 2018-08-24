<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/Profiles/getters';
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
export default class Profiles extends BlockComponent {
  valueInput = 0;

  get block() {
    return getById(this.$store, this.$props.id);
  }

  get active() {
    return this.block.data.active;
  }
}
</script>

<template>
  <q-card>
    <q-card-title>Profiles ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>

        <q-list-header>Active Profiles</q-list-header>

        <q-item
          v-for="profile in active"
          :key="profile"
        >
          <q-item-main>
            <q-item-tile sublabel>{{ profile }}</q-item-tile>
          </q-item-main>
        </q-item>

      </q-list>
    </q-card-main>
  </q-card>
</template>
