<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { InactiveObjectBlock } from '@/plugins/spark/types';
import { featureStore } from '@/store/features';


@Component
export default class InactiveObjectWidget
  extends BlockWidgetBase<InactiveObjectBlock> {

  get actualFeatureTitle(): string {
    return featureStore.widgetTitle(this.block.data.actualType);
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
        This {{ actualFeatureTitle }} block is disabled.
        <br>To enable it, ensure that it is in an enabled group.
      </template>
    </CardWarning>
  </CardWrapper>
</template>
