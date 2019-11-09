<script lang="ts">
import isString from 'lodash/isString';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

@Component
export default class BlockDialogButton extends Vue {

  @Prop({ type: String, validator: v => v === null || isString(v) })
  readonly blockId!: string;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get block(): Block | null {
    return !!this.blockId
      ? sparkStore.blocks(this.serviceId)[this.blockId] || null
      : null;
  }

  openDialog(): void {
    showBlockDialog(this.block);
  }
}
</script>

<template>
  <q-btn
    :disable="!block"
    :icon="block ? 'mdi-pencil' : 'mdi-pencil-off'"
    v-bind="$attrs"
    @click="openDialog"
  >
    <slot />
  </q-btn>
</template>
