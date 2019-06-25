<script lang="ts">

import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store/';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockGroupsAction extends BlockCrudComponent {

  @Prop({ type: String, default: 'Choose groups' })
  readonly label!: string;

  @Prop({ type: String, default: 'mdi-checkbox-multiple-marked' })
  readonly icon!: string;

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
      .onOk((groups: number[]) => this.saveBlock({ ...this.block, groups }));
  }
}
</script>

<template>
  <ActionItem v-bind="itemProps" @click="openDialog"/>
</template>
