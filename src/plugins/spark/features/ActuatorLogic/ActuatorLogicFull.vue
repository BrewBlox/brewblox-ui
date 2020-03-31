<script lang="ts">
import { debounce } from 'quasar';
import { Component } from 'vue-property-decorator';

import { Link, Temp } from '@/helpers/units';
import { interfaceTypes, isCompatible } from '@/plugins/spark/block-types';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';

import {
  analogEnd,
  analogIdx,
  analogKey,
  codeKey,
  comparisonCheck,
  digitalEnd,
  digitalIdx,
  digitalKey,
  ExpressionError,
  keyCode,
  prettifyAnalogOp,
  prettifyClause,
  prettifyDigitalOp,
  sanitize,
  syntaxCheck,
} from './helpers';
import {
  ActuatorLogicBlock,
  AnalogCompare,
  AnalogCompareOp,
  DigitalCompare,
  DigitalCompareOp,
  EvalResult,
} from './types';

const validTypes: string[] = [
  interfaceTypes.ActuatorDigital,
  interfaceTypes.ProcessValue,
];

@Component
export default class ActuatorLogicFull
  extends BlockCrudComponent<ActuatorLogicBlock> {

  saveExpression = (expr: string) => { void expr; }

  created(): void {
    this.saveExpression = debounce((expr: string) => {
      this.block.data.expression = sanitize(expr ?? '');
      this.saveBlock();
    }, 200);
  }

  get tempUnit(): string {
    return sparkStore.units(this.serviceId).Temp;
  }

  get validBlocks(): Block[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => isCompatible(block.type, validTypes));
  }

  get digital(): { key: string; cmp: DigitalCompare }[] {
    return this.block.data.digital
      .map((cmp, idx) => ({ key: digitalKey(idx), cmp }));
  }

  get analog(): { key: string; cmp: AnalogCompare }[] {
    return this.block.data.analog
      .map((cmp, idx) => ({ key: analogKey(idx), cmp }));
  }

  get clauses(): { clause: string; pretty: string }[] {
    return '()!&|^'
      .split('')
      .map(clause => ({ clause, pretty: prettifyClause(clause) }));
  }

  get err(): null | ExpressionError {
    return syntaxCheck(this.block.data.expression)
      ?? comparisonCheck(this.block.data.expression, this.block);
  }

  chipColor(index: number): string {
    return index === this.err?.index
      ? 'negative'
      : 'blue-grey-8';
  }

  get expression(): string {
    return this.block.data.expression;
  }

  addComparison(block: Block): void {
    if (isCompatible(block.type, interfaceTypes.ActuatorDigital)) {
      this.block.data.digital.push({
        op: DigitalCompareOp.VALUE_IS,
        id: new Link(block.id, block.type),
        rhs: DigitalState.Active,
        result: EvalResult.EMPTY,
      });
    }
    if (isCompatible(block.type, interfaceTypes.ProcessValue)) {
      this.block.data.analog.push({
        op: AnalogCompareOp.VALUE_GE,
        id: new Link(block.id, block.type),
        rhs: 50,
        result: EvalResult.EMPTY,
      });
    }
    this.saveBlock();
  }


  prettyDigital(cmp: DigitalCompare): string {
    return `${cmp.id.toString()} ${prettifyDigitalOp(cmp.op)} ${DigitalState[cmp.rhs]}`;
  }

  prettyAnalog(cmp: AnalogCompare): string {
    const block = sparkStore.tryBlockById(this.serviceId, cmp.id.id);
    const rhs = block && isCompatible(block.type, interfaceTypes.SetpointSensorPair)
      ? new Temp(cmp.rhs).convert(this.tempUnit).toString()
      : `${cmp.rhs}`;

    return `${cmp.id.toString()} ${prettifyAnalogOp(cmp.op)} ${rhs}`;
  }

  editDigital(key: string, cmp: DigitalCompare): void {
    console.log(key);
  }

  editAnalog(key: string, cmp: AnalogCompare): void {
    console.log(key);
  }

  removeDigital(key: string): void {
    const code = keyCode(key);
    this.block.data.digital.splice(digitalIdx(key), 1);
    this.block.data.expression = this.expression
      .split('')
      .map(v => v === key ? '?' : v)
      .map(keyCode)
      .map(v => code < v && v <= digitalEnd ? v - 1 : v)
      .map(codeKey)
      .join('');
    this.saveBlock();
  }

  removeAnalog(key: string): void {
    const code = keyCode(key);
    this.block.data.analog.splice(analogIdx(key), 1);
    this.block.data.expression = this.expression
      .split('')
      .map(v => v === key ? '?' : v)
      .map(keyCode)
      .map(v => code < v && v <= analogEnd ? v - 1 : v)
      .map(codeKey)
      .join('');
    this.saveBlock();
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
      <q-input
        :value="expression"
        label="Expression"
        title="Expression"
        item-aligned
        clearable
        placeholder="(a|b)&amp;(c^d)&amp;!e"
        type="text"
        class="expression-editor"
        @input="saveExpression"
      />

      <div v-if="err" class="error-indicator q-pa-md text-negative">
        <div>{{ expression }}</div>
        <div>{{ err.indicator }}</div>
        <div>{{ err.message }}</div>
      </div>

      <LabeledField label="Active comparisons">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="{key, cmp} in digital"
            :key="`digital-${key}`"
            removable
            class="hoverable"
            color="blue-grey-8"
            @click.native="editDigital(key, cmp)"
            @remove="removeDigital(key)"
          >
            <b class="text-lime-6 q-mr-sm">{{ key }}</b>
            {{ prettyDigital(cmp) }}
          </q-chip>
          <q-chip
            v-for="{key, cmp} in analog"
            :key="`analog-${key}`"
            removable
            class="hoverable"
            color="blue-grey-8"
            @click.native="editAnalog(key, cmp)"
            @remove="removeAnalog(key)"
          >
            <b class="text-orange-6 q-mr-sm">{{ key }}</b>
            {{ prettyAnalog(cmp) }}
          </q-chip>
        </div>
      </LabeledField>

      <LabeledField label="Add clause">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="{clause, pretty} in clauses"
            :key="`suggestion-${clause}`"
            class="hoverable"
            color="blue-grey-8"
            @click.native="block.data.expression += clause; saveBlock()"
          >
            {{ pretty }}
          </q-chip>
        </div>
      </LabeledField>

      <LabeledField label="Add comparison">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="block in validBlocks"
            :key="`block-${block.id}`"
            class="hoverable"
            color="blue-grey-8"
            @click.native="addComparison(block)"
          >
            {{ block.id }}
          </q-chip>
        </div>
      </LabeledField>

      <LinkField
        :value="block.data.targetId"
        :service-id="serviceId"
        title="target"
        label="Digital Actuator Target"
        @input="v => { block.data.targetId = v; saveBlock(); }"
      />
    </div>
  </div>
</template>

<style lang="sass">
.expression-editor .q-field__native
  font-family: "Lucida Console", Monaco, monospace

.error-indicator
  font-family: "Lucida Console", Monaco, monospace
</style>
