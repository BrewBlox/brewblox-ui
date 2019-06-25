<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { Spark3PinId, Spark3PinsBlock } from './types';

@Component
export default class Spark3PinsWidget extends BlockWidget {
  Spark3PinId = Spark3PinId;
  readonly block!: Spark3PinsBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud"/>

    <IoArray :crud="crud" :id-enum="Spark3PinId"/>
  </q-card>
</template>
