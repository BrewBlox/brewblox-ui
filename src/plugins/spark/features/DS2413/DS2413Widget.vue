<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DS2413Block } from './types';

@Component
export default class DS2413Widget extends BlockWidget {
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud"/>
    <IoArray :crud="crud"/>
  </q-card>
</template>
