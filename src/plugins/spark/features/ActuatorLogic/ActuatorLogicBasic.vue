<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { sparkStore } from '../../store';
import AnalogCompareEditDialog from './AnalogCompareEditDialog.vue';
import DigitalCompareEditDialog from './DigitalCompareEditDialog.vue';
import { evalResultTitles, nonErrorResults } from './getters';
import {
  analogIdx, analogKey,
  comparisonCheck,
  digitalIdx,
  digitalKey,
  isDigital,
  isKey,
  prettyAnalog,
  prettyDigital,
  syntaxCheck} from './helpers';
import {
  ActuatorLogicBlock,
  AnalogCompare,
  DigitalCompare,
  EvalResult,
  ExpressionError,
} from './types';

@Component({
  components: {
    AnalogCompareEditDialog,
    DigitalCompareEditDialog,
  },
})
export default class ActuatorLogicBasic
  extends BlockCrudComponent<ActuatorLogicBlock> {

  get tempUnit(): string {
    return sparkStore.units(this.serviceId).Temp;
  }

  keyColor(key: string): string {
    if (!isKey(key)) { return 'white'; }
    const arr: { key: string; cmp: AnalogCompare | DigitalCompare }[] =
      isDigital(key)
        ? this.digital
        : this.analog;
    return arr.find(v => v.key === key)?.cmp.result === EvalResult.TRUE
      ? 'positive'
      : 'negative';
  }

  get expression(): { char: string; color: string }[] {
    return this.block.data.expression
      .split('')
      .map(char => ({
        char,
        color: this.keyColor(char),
      }));
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

  get result(): string {
    return this.err
      ? `Error: ${this.err.message}`
      : evalResultTitles[this.block.data.result];
  }

  get digital(): { key: string; cmp: DigitalCompare; pretty: string }[] {
    return this.block.data.digital
      .map((cmp, idx) => ({
        cmp,
        key: digitalKey(idx),
        pretty: prettyDigital(cmp),
      }));
  }

  get analog(): { key: string; cmp: AnalogCompare; pretty: string }[] {
    return this.block.data.analog
      .map((cmp, idx) => ({
        cmp,
        key: analogKey(idx),
        pretty: prettyAnalog(
          cmp,
          sparkStore.tryBlockById(this.serviceId, cmp.id.id)?.type ?? null,
          this.tempUnit,
        ),
      }));
  }

  editDigital(key: string, cmp: DigitalCompare): void {
    createDialog({
      component: DigitalCompareEditDialog,
      serviceId: this.serviceId,
      title: 'Edit comparison',
      value: cmp,
    })
      .onOk(cmp => {
        this.block.data.digital.splice(digitalIdx(key), 1, cmp);
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
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body">
      <div class="row wrap q-pa-sm">
        <LabeledField
          label="Expression"
          class="col-grow"
        >
          <span
            v-for="({char, color}, idx) in expression"
            :key="`expression-${idx}`"
            :class="[`text-${color}`, 'expression-field']"
          >
            {{ char }}
          </span>
        </LabeledField>
        <LabeledField
          label="Result"
          class="col-grow"
        >
          <div :class="err && 'text-negative'">
            {{ result }}
          </div>
        </LabeledField>
      </div>

      <LabeledField
        label="Active comparisons"
        tag-class="col-grow"
      >
        <div class="row q-gutter-xs col-grow">
          <q-chip
            v-for="{key, cmp, pretty} in digital"
            :key="`digital-${key}`"
            color="blue-grey-8"
            class="hoverable full-width"
            @click.native="editDigital(key, cmp)"
          >
            <div class="row wrap q-gutter-x-sm col-grow">
              <div
                class="text-lime-6 text-bold col-auto"
                style="width: 1em"
              >
                {{ key }}
              </div>
              <q-icon
                name="mdi-checkbox-blank-circle"
                :color="cmp.result === 1 ? 'positive' : 'negative'"
                class="col-auto self-center"
              />
              <div class="col ellipsis">
                {{ cmp.id | link }}
              </div>
              <div class="col ellipsis-left">
                {{ pretty }}
              </div>
              <q-tooltip>
                {{ cmp.id | link }} [{{ pretty }}]
              </q-tooltip>
            </div>
          </q-chip>
          <q-chip
            v-for="{key, cmp, pretty} in analog"
            :key="`analog-${key}`"
            color="blue-grey-8"
            class="hoverable full-width"
            @click.native="editAnalog(key, cmp)"
          >
            <div class="row wrap q-gutter-x-sm col-grow">
              <div
                class="text-orange-6 text-bold col-auto"
                style="width: 1em"
              >
                {{ key }}
              </div>
              <q-icon
                name="mdi-checkbox-blank-circle"
                :color="cmp.result === 1 ? 'positive' : 'negative'"
                class="col-auto self-center"
              />
              <div class="col ellipsis">
                {{ cmp.id | link }}
              </div>
              <div class="col ellipsis-left">
                {{ pretty }}
              </div>
              <q-tooltip>
                {{ cmp.id | link }} [{{ pretty }}]
              </q-tooltip>
            </div>
          </q-chip>
        </div>
      </LabeledField>
    </div>
  </div>
</template>

<style lang="sass">
.expression-field
  font-family: "Lucida Console", Monaco, monospace
</style>
