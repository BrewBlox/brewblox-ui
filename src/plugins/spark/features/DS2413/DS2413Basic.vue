<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '../../components/BlockCrudComponent';
import { DS2413Block } from './types';

@Component
export default class D2413Basic extends BlockCrudComponent {
  readonly block!: DS2413Block;
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />
    <IoArray :crud="crud" />
  </q-card>
</template>
