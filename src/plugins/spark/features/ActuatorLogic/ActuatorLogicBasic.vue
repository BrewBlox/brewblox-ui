<script setup lang="ts">
import AnalogCompareEditDialog from './AnalogCompareEditDialog.vue';
import DigitalCompareEditDialog from './DigitalCompareEditDialog.vue';
import { nonErrorResults } from './const';
import { ExpressionError } from './types';
import {
  analogIdx,
  analogKey,
  comparisonCheck,
  digitalIdx,
  digitalKey,
  isDigital,
  isKey,
  prettyAnalog,
  prettyDigital,
  syntaxCheck,
} from './utils';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_LOGIC_RESULT } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { createComponentDialog } from '@/utils/dialog';
import { prettyLink } from '@/utils/quantity';
import {
  ActuatorLogicBlock,
  AnalogCompare,
  DigitalCompare,
  LogicResult,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'ActuatorLogicBasic',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, block, patchBlock } =
      useBlockWidget.setup<ActuatorLogicBlock>();

    const digital = computed<
      { key: string; cmp: DigitalCompare; pretty: string }[]
    >(() =>
      block.value.data.digital.map((cmp, idx) => ({
        cmp,
        key: digitalKey(idx),
        pretty: prettyDigital(cmp),
      })),
    );

    const analog = computed<
      { key: string; cmp: AnalogCompare; pretty: string }[]
    >(() =>
      block.value.data.analog.map((cmp, idx) => ({
        cmp,
        key: analogKey(idx),
        pretty: prettyAnalog(
          cmp,
          sparkStore.blockByLink(serviceId, cmp.id)?.type ?? null,
        ),
      })),
    );

    function keyColor(key: string): string {
      if (!isKey(key)) {
        return 'white';
      }
      const arr: { key: string; cmp: AnalogCompare | DigitalCompare }[] =
        isDigital(key) ? digital.value : analog.value;
      return arr.find((v) => v.key === key)?.cmp.result ===
        LogicResult.RESULT_TRUE
        ? 'positive'
        : 'negative';
    }

    const expression = computed<{ char: string; color: string }[]>(() =>
      block.value.data.expression.split('').map((char) => ({
        char,
        color: keyColor(char),
      })),
    );

    const firmwareError = computed<ExpressionError | null>(() => {
      const { result, errorPos } = block.value.data;
      const index = Math.max(0, errorPos - 1);
      return nonErrorResults.includes(result)
        ? null
        : {
            index,
            message: ENUM_LABELS_LOGIC_RESULT[result],
            indicator: '-'.repeat(index) + '^',
          };
    });

    const err = computed<ExpressionError | null>(
      () =>
        syntaxCheck(block.value.data.expression) ??
        comparisonCheck(block.value.data) ??
        firmwareError.value,
    );

    const result = computed<string>(() =>
      err.value
        ? `Error: ${err.value.message}`
        : ENUM_LABELS_LOGIC_RESULT[block.value.data.result],
    );

    function editDigital(key: string, cmp: DigitalCompare): void {
      createComponentDialog({
        component: DigitalCompareEditDialog,
        componentProps: {
          modelValue: cmp,
          serviceId,
          title: 'Edit comparison',
        },
      }).onOk((cmp) => {
        const digital = [...block.value.data.digital];
        digital[digitalIdx(key)] = cmp;
        patchBlock({ digital });
      });
    }

    function editAnalog(key: string, cmp: AnalogCompare): void {
      createComponentDialog({
        component: AnalogCompareEditDialog,
        componentProps: {
          modelValue: cmp,
          serviceId,
          title: 'Edit comparison',
        },
      }).onOk((cmp) => {
        const analog = [...block.value.data.analog];
        analog[analogIdx(key)] = cmp;
        patchBlock({ analog });
      });
    }

    return {
      prettyLink,
      expression,
      err,
      result,
      digital,
      analog,
      editDigital,
      editAnalog,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body">
      <div class="row wrap q-pa-sm">
        <LabeledField
          label="Expression"
          class="col-grow"
        >
          <span
            v-for="({ char, color }, idx) in expression"
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
            v-for="{ key, cmp, pretty } in digital"
            :key="`digital-${key}`"
            color="blue-grey-8"
            class="hoverable full-width"
            clickable
            @click="editDigital(key, cmp)"
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
                :color="cmp.result === 'RESULT_TRUE' ? 'positive' : 'negative'"
                class="col-auto self-center"
              />
              <div class="col ellipsis">
                {{ prettyLink(cmp.id) }}
              </div>
              <div class="col ellipsis-left">
                {{ pretty }}
              </div>
              <q-tooltip> {{ prettyLink(cmp.id) }} [{{ pretty }}] </q-tooltip>
            </div>
          </q-chip>
          <q-chip
            v-for="{ key, cmp, pretty } in analog"
            :key="`analog-${key}`"
            color="blue-grey-8"
            class="hoverable full-width"
            clickable
            @click="editAnalog(key, cmp)"
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
                :color="cmp.result === 'RESULT_TRUE' ? 'positive' : 'negative'"
                class="col-auto self-center"
              />
              <div class="col ellipsis">
                {{ prettyLink(cmp.id) }}
              </div>
              <div class="col ellipsis-left">
                {{ pretty }}
              </div>
              <q-tooltip> {{ prettyLink(cmp.id) }} [{{ pretty }}] </q-tooltip>
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
