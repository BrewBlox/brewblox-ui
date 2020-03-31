<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { evalResultTitles, nonErrorResults } from './getters';
import { comparisonCheck, syntaxCheck } from './helpers';
import { ActuatorLogicBlock, ExpressionError } from './types';

@Component
export default class ActuatorLogicBasic
  extends BlockCrudComponent<ActuatorLogicBlock> {

  get firmwareError(): null | ExpressionError {
    const { result, errorPos } = this.block.data;
    const index = Math.max(0, errorPos - 1);
    return nonErrorResults.includes(result)
      ? null
      : {
        index,
        message: evalResultTitles[result],
        indicator: '-'.repeat(index) + '^',
      };
  }

  get err(): null | ExpressionError {
    return syntaxCheck(this.block.data.expression)
      ?? comparisonCheck(this.block.data)
      ?? this.firmwareError;
  }

  get result(): string {
    return this.err
      ? `Error: ${this.err.message}`
      : evalResultTitles[this.block.data.result];
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body">
      <div class="row q-pa-sm">
        <LabeledField label="Expression" class="col-grow">
          <div class="expression-field">
            {{ block.data.expression }}
          </div>
        </LabeledField>
        <LabeledField label="Output" class="col-grow">
          <div :class="err && 'text-negative'">
            {{ result }}
          </div>
        </LabeledField>
      </div>
    </div>
  </div>
</template>

<style lang="sass">
.expression-field
  font-family: "Lucida Console", Monaco, monospace
</style>
