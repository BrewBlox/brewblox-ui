<script lang="ts">

import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store/';

import { Block } from '../types';

@Component
export default class BlockGroupsAction extends Vue {

  @Prop({ type: Object, required: true })
  readonly block!: Block;

  @Prop({ type: String, default: 'Choose groups' })
  readonly label!: string;

  @Prop({ type: String, default: 'mdi-checkbox-multiple-marked' })
  readonly icon!: string;

  get serviceId(): string {
    return this.block.serviceId;
  }

  get itemProps() {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  openDialog() {
    Dialog.create({
      title: this.label,
      message: 'Choose Block groups. The Block will become inactive if it is not part of any active groups.',
      dark: true,
      cancel: true,
      options: {
        type: 'checkbox',
        model: [...this.block.groups],
        items: sparkStore.groupNames(this.serviceId)
          .map((p, idx) => ({ label: p, value: idx })),
      },
    })
      .onOk((groups: number[]) => {
        sparkStore.saveBlock([this.serviceId, { ...this.block, groups }]);
      });
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="openDialog"/>
</template>
