<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsForm extends BlockForm {
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>

    <q-card-section>todo</q-card-section>
  </q-card>
</template>
