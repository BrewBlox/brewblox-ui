<script lang="ts">
import Component from 'vue-class-component';

import BlockComponent from '../BlockComponent';

import { getById } from '@/store/blocks/Profiles/getters';
import { saveBlock } from '@/store/blocks/actions';
import { updateBlockState } from '@/store/blocks/mutations';

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

  get sysProfiles(): string[] {
    return this.block.data.active.map(v => v.toString());
  }

  set sysProfiles(p: string[]) {
    this.block.data.active = p.map(v => parseInt(v, 10));
    updateBlockState(this.$store, this.block);
  }
}
</script>

<template>
  <q-card>

    <q-card-title>Profiles ({{ id }})</q-card-title>

    <q-card-main>
      <q-list>

        <q-list-header>Active Profiles</q-list-header>

        <q-item>
          <q-item-main>
            <q-toggle class=rotate-270 v-model="sysProfiles" val=0 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=1 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=2 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=3 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=4 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=5 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=6 />
            <q-toggle class=rotate-270 v-model="sysProfiles" val=7 />
          </q-item-main>
        </q-item>

      </q-list>
    </q-card-main>

  </q-card>
</template>
