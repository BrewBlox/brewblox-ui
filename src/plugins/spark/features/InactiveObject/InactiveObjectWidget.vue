<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { featureStore } from '@/store/features';

import { InactiveObjectBlock } from './types';

@Component
export default class InactiveObjectWidget extends BlockWidgetBase {
  readonly block!: InactiveObjectBlock;

  get actualDisplayName(): string {
    return featureStore.displayName(this.block.data.actualType);
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>
    <CardWarning v-if="!block.data.connected">
      <template #message>
        This {{ actualDisplayName }} block is disabled.
        <br>To enable it, ensure that it is in an enabled group.
      </template>
    </CardWarning>
  </CardWrapper>
</template>
