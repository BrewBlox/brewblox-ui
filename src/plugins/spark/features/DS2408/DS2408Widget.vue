<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DS2408Block, DS2408Id } from './types';

@Component
export default class DS2408Widget extends BlockWidget {
  DS2408Id = DS2408Id;
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me"/>
    <IoArray v-bind="$props" :id-enum="DS2408Id"/>
  </q-card>
</template>
