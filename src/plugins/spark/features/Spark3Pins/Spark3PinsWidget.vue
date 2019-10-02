<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Spark3PinId, Spark3PinsBlock } from './types';

@Component
export default class Spark3PinsWidget extends BlockWidgetBase {
  Spark3PinId = Spark3PinId;
  readonly block!: Spark3PinsBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <IoArray :crud="crud" :id-enum="Spark3PinId" />
  </q-card>
</template>
