<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DS2413Block, DS2413Id } from './types';

@Component
export default class DS2413Widget extends BlockWidget {
  DS2413Id = DS2413Id;
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud"/>

    <IoArray v-bind="$props" :id-enum="DS2413Id" v-on="$listeners"/>
  </q-card>
</template>
