<template>
  <q-card style="margin-bottom: 20px">
    <q-card-title>SetPointSimple ({{ id }})</q-card-title>

    <q-card-main>
      <p class="text-weight-medium">Settings</p>
      <div>
        <span>Value</span><span>{{ settings.value }}</span>
      </div>
    </q-card-main>
  </q-card>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import { getById } from '../../store/blocks/SetPointSimple/getters';
import { SetPointSimpleBlock } from '../../store/blocks/SetPointSimple/SetPointSimple';

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
export default class SetPointSimple extends Vue {
  get blockData(): SetPointSimpleBlock {
    const block = getById(this.$props.id);
    return block;
  }

  get settings() {
    return this.blockData.settings;
  }
}
</script>
