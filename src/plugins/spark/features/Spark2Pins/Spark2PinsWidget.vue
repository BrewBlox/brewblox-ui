<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { Spark2PinId, Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsWidget extends BlockWidget {
  Spark2PinId = Spark2PinId;
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me"/>

    <IoArray v-bind="$props" :id-enum="Spark2PinId"/>
  </q-card>
</template>
