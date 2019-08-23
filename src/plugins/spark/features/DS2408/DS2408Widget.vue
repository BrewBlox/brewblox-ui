<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Widget extends BlockWidget {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <CardWarning v-if="!block.data.connected">
      <template #message>
        DS2408 is not connected
      </template>
    </CardWarning>
    <ValveArray :crud="crud" :id-enum="DS2408Id" :name-enum="ValveStartId" />
  </q-card>
</template>
