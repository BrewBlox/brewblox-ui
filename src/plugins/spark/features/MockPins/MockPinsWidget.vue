<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { MockPinsBlock } from './types';

@Component
export default class MockPinsWidget
  extends BlockWidgetBase<MockPinsBlock> {
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>
    <div class="widget-md">
      <IoArray :crud="crud" />
    </div>
  </CardWrapper>
</template>
