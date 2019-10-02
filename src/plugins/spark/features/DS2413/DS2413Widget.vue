<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { DS2413Block } from './types';

@Component
export default class DS2413Widget extends BlockWidgetBase {
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <CardWarning v-if="!block.data.connected">
      <template #message>
        DS2413 is not connected.
      </template>
    </CardWarning>
    <IoArray :crud="crud" />
  </q-card>
</template>
