<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsWidget
  extends BlockWidgetBase<Spark2PinsBlock> {
}
</script>

<template>
  <CardWrapper v-bind="{context}">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" />
    </template>
    <IoArray :crud="crud" />
  </CardWrapper>
</template>
