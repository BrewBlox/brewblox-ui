<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '../../components/BlockCrudComponent';
import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Basic extends BlockCrudComponent {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <ValveArray :crud="crud" :id-enum="DS2408Id" :name-enum="ValveStartId" />
  </q-card>
</template>
