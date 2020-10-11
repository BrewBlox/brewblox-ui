<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { typeMatchFilter } from '@/helpers/functional';
import { systemGroup } from '@/plugins/spark/getters';
import { BlockType, GroupsBlock } from '@/plugins/spark/types';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockGroupsAction extends BlockCrudComponent {

  @Prop({ type: String, default: 'Block groups (deprecated)' })
  readonly label!: string;

  @Prop({ type: String, default: 'mdi-checkbox-multiple-marked' })
  readonly icon!: string;

  get isSystemBlock(): boolean {
    return this.block.groups.includes(systemGroup);
  }

  get itemProps(): Mapped<any> {
    return {
      ...this.$attrs,
      ...this.$props,
    };
  }

  openDialog(): void {
    const active: number[] = this.sparkModule.blocks
      .find(typeMatchFilter<GroupsBlock>(BlockType.Groups))
      ?.data.active
      ?? [];
    createDialog({
      title: this.label,
      message: 'The block will become inactive if it is not part of any active groups.',
      cancel: true,
      options: {
        type: 'checkbox',
        model: [...this.block.groups],
        items: Array.apply(null, Array(7))
          .map((_, idx) => ({
            label: `Group ${idx + 1} ${active.includes(idx) ? '(active)' : ''}`,
            value: idx,
          })),
      },
    })
      .onOk((groups: number[]) => this.saveBlock({ ...this.block, groups }));
  }
}
</script>

<template>
  <ActionItem v-if="!isSystemBlock" v-bind="itemProps" @click="openDialog" />
</template>
