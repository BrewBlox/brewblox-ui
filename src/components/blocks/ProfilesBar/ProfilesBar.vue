<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import BlockComponent from '@/components/blocks/BlockComponent';

import { blockById } from '@/store/blocks/getters';
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
export default class ProfilesBar extends BlockComponent {
  get block() {
    return blockById(this.$store, this.$props.id);
  }

  get barProfiles(): string[] {
    return this.block.profiles.map(v => v.toString());
  }

  set barProfiles(p: string[]) {
    this.block.profiles = p.map(v => parseInt(v, 10));
    updateBlockState(this.$store, this.block);
  }
}
</script>

<template>
  <q-item>
    <q-item-main>
      <q-toggle class=rotate-270 v-model="barProfiles" val=0 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=1 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=2 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=3 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=4 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=5 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=6 />
      <q-toggle class=rotate-270 v-model="barProfiles" val=7 />
    </q-item-main>
  </q-item>
</template>
