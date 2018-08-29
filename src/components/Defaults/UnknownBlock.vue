<script lang="ts">
import Component from 'vue-class-component';

import { blockById } from '@/store/blocks/getters';
import BlockComponent from '../BlockComponent';

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
export default class UnknownBlock extends BlockComponent {
  get block() {
    return blockById(this.$store, this.$props.id);
  }

  get changed() {
    return false;
  }
}
</script>

<template>
  <q-card>
    <q-card-title>Unknown type "{{ type }}" ({{ id }})</q-card-title>
  </q-card>
</template>

<style scoped>
</style>
