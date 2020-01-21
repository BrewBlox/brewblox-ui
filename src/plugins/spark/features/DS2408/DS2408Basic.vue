<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { DS2408Block, DS2408Id, ValveStartId } from './types';

@Component
export default class DS2408Basic
  extends BlockCrudComponent<DS2408Block> {
  DS2408Id = DS2408Id;
  ValveStartId = ValveStartId;
}
</script>

<template>
  <div>
    <slot name="warnings" />
    <ValveArray :crud="crud" :id-enum="DS2408Id" :name-enum="ValveStartId" />
  </div>
</template>
