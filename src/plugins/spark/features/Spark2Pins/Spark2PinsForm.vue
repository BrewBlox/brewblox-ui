<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { Spark2PinsBlock } from './types';

@Component
export default class Spark2PinsForm extends BlockCrudComponent {
  readonly block!: Spark2PinsBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud"/>

    <IoArray :crud="crud"/>
  </q-card>
</template>
