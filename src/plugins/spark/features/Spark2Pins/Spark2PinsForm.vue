<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { Spark2PinId, Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsForm extends BlockForm {
  Spark2PinId = Spark2PinId;
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props" v-on="$listeners"/>

    <IoArray v-bind="$props" :id-enum="Spark2PinId" v-on="$listeners"/>
  </q-card>
</template>
