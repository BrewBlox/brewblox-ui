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
  prettyAnalog,
  prettyDigital,
  syntaxCheck} from './helpers';
import {
  ActuatorLogicBlock,
  AnalogCompare,
  DigitalCompare,
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
      <LabeledField label="Active comparisons">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="{key, cmp, pretty} in digital"
            :key="`digital-${key}`"
            color="blue-grey-8"
            class="hoverable"
            @click.native="editDigital(key, cmp)"
          >
            <b class="text-lime-6 q-mr-sm">{{ key }}</b>
            {{ pretty }}
          </q-chip>
          <q-chip
            v-for="{key, cmp, pretty} in analog"
            :key="`analog-${key}`"
            color="blue-grey-8"
            class="hoverable"
            @click.native="editAnalog(key, cmp)"
          >
            <b class="text-orange-6 q-mr-sm">{{ key }}</b>
            {{ pretty }}
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
