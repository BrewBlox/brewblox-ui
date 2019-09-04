<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsWidget extends BlockWidget {
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <IoArray :crud="crud" />
  </q-card>
</template>
