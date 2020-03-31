<script lang="ts">
import { debounce } from 'quasar';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { Link, Temp } from '@/helpers/units';
import { interfaceTypes, isCompatible } from '@/plugins/spark/block-types';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block, DigitalState } from '@/plugins/spark/types';

import AnalogCompareEditDialog from './AnalogCompareEditDialog.vue';
import DigitalCompareEditDialog from './DigitalCompareEditDialog.vue';
import { analogOpTitles, characterTitles, digitalOpTitles, evalResultTitles, nonErrorResults } from './getters';
import {
  analogIdx,
  analogKey,
  comparisonCheck,
  digitalIdx,
  digitalKey,
  sanitize,
  shiftRemainingComparisons,
  syntaxCheck,
} from './helpers';
import {
  ActuatorLogicBlock,
  AnalogCompare,
  AnalogCompareOp,
  DigitalCompare,
  DigitalCompareOp,
  EvalResult,
  ExpressionError,
} from './types';

const validTypes: string[] = [
  interfaceTypes.ActuatorDigital,
  interfaceTypes.ProcessValue,
];

@Component({
  components: {
    AnalogCompareEditDialog,
    DigitalCompareEditDialog,
  },
})
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

  get characters(): { char: string; pretty: string }[] {
    return '()!&|^'
      .split('')
      .map(char => ({ char, pretty: characterTitles[char] ?? char }));
  }

  get digital(): { key: string; cmp: DigitalCompare }[] {
    return this.block.data.digital
      .map((cmp, idx) => ({ key: digitalKey(idx), cmp }));
  }

  get analog(): { key: string; cmp: AnalogCompare }[] {
    return this.block.data.analog
      .map((cmp, idx) => ({ key: analogKey(idx), cmp }));
  }

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
        rhs: 25,
        result: EvalResult.EMPTY,
      });
    }
    this.saveBlock();
  }

  prettyDigital(cmp: DigitalCompare): string {
    return `${cmp.id.toString()} ${digitalOpTitles[cmp.op]} ${DigitalState[cmp.rhs]}`;
  }

  prettyAnalog(cmp: AnalogCompare): string {
    const block = sparkStore.tryBlockById(this.serviceId, cmp.id.id);
    const rhs = block && isCompatible(block.type, interfaceTypes.SetpointSensorPair)
      ? new Temp(cmp.rhs).convert(this.tempUnit).toString()
      : `${cmp.rhs}`;

    return `${cmp.id.toString()} ${analogOpTitles[cmp.op]} ${rhs}`;
  }

  editDigital(key: string, cmp: DigitalCompare): void {
    createDialog({
      component: DigitalCompareEditDialog,
      serviceId: this.serviceId,
      title: 'Edit comparison',
      value: cmp,
    })
      .onOk(cmp => {
        this.block.data.analog.splice(digitalIdx(key), 1, cmp);
        this.saveBlock();
      });
  }

  editAnalog(key: string, cmp: AnalogCompare): void {
    createDialog({
      component: AnalogCompareEditDialog,
      serviceId: this.serviceId,
      title: 'Edit comparison',
      value: cmp,
    })
      .onOk(cmp => {
        this.block.data.analog.splice(analogIdx(key), 1, cmp);
        this.saveBlock();
      });
  }

  removeDigital(key: string): void {
    this.block.data.digital.splice(digitalIdx(key), 1);
    this.block.data.expression = shiftRemainingComparisons(this.expression, key);
    this.saveBlock();
  }

  removeAnalog(key: string): void {
    this.block.data.analog.splice(analogIdx(key), 1);
    this.block.data.expression = shiftRemainingComparisons(this.expression, key);
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
      >
        <template #append>
          <q-btn
            v-if="expression.length"
            :ripple="false"
            flat
            round
            icon="mdi-backspace"
            class="hoverless"
            @click="saveExpression(expression.substring(0, expression.length -1))"
          />
        </template>
      </q-input>

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

      <LabeledField label="Add character">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="{char, pretty} in characters"
            :key="`suggestion-${char}`"
            class="hoverable"
            color="blue-grey-8"
            @click.native="saveExpression(block.data.expression + char)"
          >
            {{ char }}
            <q-tooltip>{{ pretty }}</q-tooltip>
          </q-chip>
          <q-chip
            v-for="{key, cmp} in digital"
            :key="`digital-add-${key}`"
            class="hoverable text-bold"
            color="blue-grey-8"
            text-color="lime-6"
            @click.native="saveExpression(block.data.expression + key)"
          >
            {{ key }}
            <q-tooltip>{{ prettyDigital(cmp) }}</q-tooltip>
          </q-chip>
          <q-chip
            v-for="{key, cmp} in analog"
            :key="`analog-add-${key}`"
            class="hoverable text-bold"
            color="blue-grey-8"
            text-color="orange-6"
            @click.native="saveExpression(block.data.expression + key)"
          >
            {{ key }}
            <q-tooltip>{{ prettyAnalog(cmp) }}</q-tooltip>
          </q-chip>
        </div>
      </LabeledField>

      <LabeledField label="Create comparison">
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
.expression-editor .q-field__native,
.error-indicator
  font-family: "Lucida Console", Monaco, monospace

.hoverless > .q-focus-helper
  opacity: 0 !important
</style>
