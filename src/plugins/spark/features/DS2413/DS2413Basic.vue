<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '../../components/BlockCrudComponent';
import { D2413Block, D2413Id, ValveStartId } from './types';

@Component
export default class D2413Basic extends BlockCrudComponent {
  D2413Id = D2413Id;
  ValveStartId = ValveStartId;
  readonly block!: D2413Block;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <IoArray :crud="crud" />
  </q-card>
</template>
