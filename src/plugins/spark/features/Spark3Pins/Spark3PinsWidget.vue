<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { Spark3PinsBlock } from './types';

@Component
export default class Spark3PinsWidget extends BlockWidget {
  readonly block!: Spark3PinsBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me"/>

    <q-card-section>todo</q-card-section>
  </q-card>
</template>
