<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsWidget extends BlockWidgetBase {
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark :class="cardClass">
    <component :is="toolbarComponent" :crud="crud" />
    <IoArray :crud="crud" />
  </q-card>
</template>
