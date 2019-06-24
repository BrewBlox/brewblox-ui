<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { Spark2PinId, Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsForm extends BlockCrudComponent {
  Spark2PinId = Spark2PinId;
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar :title="widget.title"/>

    <IoArray v-bind="$props" :id-enum="Spark2PinId" v-on="$listeners"/>
  </q-card>
</template>
