<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2413Block } from './types';

@Component
export default class D2413Basic
  extends BlockCrudComponent<DS2413Block> {
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />
    <IoArray :crud="crud" />
  </div>
</template>
