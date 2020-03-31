<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { prettifyClause } from './helpers';
import { ActuatorLogicBlock } from './types';

@Component
export default class ActuatorLogicBasic
  extends BlockCrudComponent<ActuatorLogicBlock> {

  get expression(): string {
    return this.block.data.expression
      .split('')
      .map(prettifyClause)
      .join(' ');
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <LabeledField label="Expression" class="col-grow">
        {{ expression }}
      </LabeledField>
    </div>
  </div>
</template>
