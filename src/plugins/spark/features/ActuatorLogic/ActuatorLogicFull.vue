<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Link } from '@/helpers/units';
import { interfaceTypes, isCompatible } from '@/plugins/spark/block-types';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';

import { ExpressionError, prettifySingle, syntaxCheck } from './helpers';
import { ActuatorLogicBlock, AnalogCompare, AnalogCompareOp, DigitalCompare, DigitalCompareOp } from './types';

const digitalPrettyOp: Record<DigitalCompareOp, string> = {
  [DigitalCompareOp.VALUE_IS]: '==',
  [DigitalCompareOp.VALUE_ISNOT]: '!=',
  [DigitalCompareOp.DESIRED_IS]: '==',
  [DigitalCompareOp.DESIRED_ISNOT]: '!=',
};

const analogPrettyOp: Record<AnalogCompareOp, string> = {
  [AnalogCompareOp.VALUE_LE]: '<=',
  [AnalogCompareOp.VALUE_GE]: '>=',
  [AnalogCompareOp.VALUE_LT]: '<',
  [AnalogCompareOp.VALUE_GT]: '>',
  [AnalogCompareOp.SETTING_LE]: '<=',
  [AnalogCompareOp.SETTING_GE]: '>=',
  [AnalogCompareOp.SETTING_LT]: '<',
  [AnalogCompareOp.SETTING_GT]: '>',
};

@Component
export default class ActuatorLogicFull
  extends BlockCrudComponent<ActuatorLogicBlock> {

  validTypes: string[] = [
    interfaceTypes.ActuatorDigital,
    interfaceTypes.ProcessValue,
  ]

  get validBlocks(): Block[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => isCompatible(block.type, this.validTypes));
  }

  compareIndex(s: string): number {
    return s.toLowerCase().charCodeAt(0) - 96;
  }

  get digitalCompares(): DigitalCompare[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => isCompatible(block.type, interfaceTypes.ActuatorDigital))
      .map(block => ({
        op: DigitalCompareOp.VALUE_IS,
        id: new Link(block.id, block.type),
        rhs: DigitalState.Active,
      }));
  }

  get analogCompares(): AnalogCompare[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => isCompatible(block.type, interfaceTypes.ProcessValue))
      .map(block => ({
        op: AnalogCompareOp.VALUE_GE,
        id: new Link(block.id, block.type),
        rhs: 50,
        threshold: 1,
      }));
  }

  get expression(): string[] {
    return this.block.data.expression.split('');
  }

  set expression(expr: string[]) {
    this.block.data.expression = expr.join('');
    this.saveBlock();
  }

  prettifyCompare(s: string): string {
    console.log(s, this.compareIndex(s));
    if (/[a-z]/.test(s)) {
      const cmp = this.digitalCompares[this.compareIndex(s)];
      return cmp
        ? `${cmp.id?.id} ${digitalPrettyOp[cmp.op]} ${DigitalState[cmp.rhs]}`
        : s;
    }
    else {
      const cmp = this.analogCompares[this.compareIndex(s)];
      return cmp
        ? `${cmp.id?.id} ${analogPrettyOp[cmp.op]} ${cmp.rhs}`
        : s;
    }
  }

  prettify(s: string): string {
    return prettifySingle(s) ?? this.prettifyCompare(s);
  }

  get clauses(): string[] {
    return '()!&|^'.split('');
  }

  get err(): null | ExpressionError {
    return syntaxCheck(this.block.data.expression);
  }

  chipColor(index: number): string {
    return index === this.err?.index
      ? 'negative'
      : 'blue-grey-8';
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings">
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`Block is enabled: ${block.data.targetId} will be set.`"
        :text-disabled="`Block is disabled: ${block.data.targetId} will not be set.`"
      />
    </slot>

    <div class="widget-body">
      <LabeledField label="Expression">
        <div class="row wrap q-gutter-xs">
          <div v-for="(expr, idx) in expression" :key="`clause-${idx}`">
            {{ prettify(expr) }}
          </div>
        </div>
      </LabeledField>

      <q-separator inset />

      <q-select
        v-model="expression"
        multiple
        use-chips
        stack-label
        label="Expression editor"
        item-aligned
        use-input
        hide-dropdown-icon
        new-value-mode="add"
        :error="err !== null"
        :error-message="err && err.message"
      >
        <template #selected-item="scope">
          <q-chip
            removable
            dense
            :tabindex="scope.tabindex"
            :color="chipColor(scope.index)"
            class="q-ma-xs"
            @remove="scope.removeAtIndex(scope.index)"
          >
            <div class="q-pa-sm">
              {{ prettify(scope.opt) }}
            </div>
          </q-chip>
        </template>
      </q-select>

      <LabeledField label="Add clause">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="clause in clauses"
            :key="`suggestion-${clause}`"
            class="hoverable"
            color="blue-grey-8"
          >
            {{ prettify(clause) }}
          </q-chip>
        </div>
      </LabeledField>

      <LabeledField label="Add comparison">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="{id} in validBlocks"
            :key="`block-${id}`"
            class="hoverable"
            color="blue-grey-8"
          >
            {{ id }}
          </q-chip>
        </div>
      </LabeledField>
    </div>
  </div>
</template>
