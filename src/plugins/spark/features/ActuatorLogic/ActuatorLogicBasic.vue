<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { prettifySingle } from './helpers';
import { ActuatorLogicBlock } from './types';

@Component
export default class ActuatorLogicBasic
  extends BlockCrudComponent<ActuatorLogicBlock> {

  get expression(): string[] {
    return this.block.data.expression
      .split('')
      .map(s => prettifySingle(s) ?? '[comparison]');
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <LabeledField label="Expression">
        <div class="row wrap q-gutter-xs">
          <div v-for="(expr, idx) in expression" :key="`clause-${idx}`">
            {{ expr }}
          </div>
        </div>
      </LabeledField>
    </div>
  </div>
</template>
