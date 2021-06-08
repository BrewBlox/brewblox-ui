<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import {
  ActuatorLogicBlock,
  AnalogCompare,
  AnalogCompareOp,
  Block,
  BlockIntfType,
  DigitalCompare,
  DigitalCompareOp,
  DigitalState,
  LogicResult,
} from '@/plugins/spark/types';
import { isCompatible } from '@/plugins/spark/utils';
import { bloxLink, createDialog, prettyLink } from '@/utils';

import AnalogCompareEditDialog from './AnalogCompareEditDialog.vue';
import DigitalCompareEditDialog from './DigitalCompareEditDialog.vue';
import { characterTitles, logicResultTitles, nonErrorResults } from './getters';
import { ExpressionError } from './types';
import {
  analogIdx,
  analogKey,
  comparisonCheck,
  digitalIdx,
  digitalKey,
  prettyAnalog,
  prettyDigital,
  shiftRemainingComparisons,
  syntaxCheck,
} from './utils';

const validTypes: BlockIntfType[] = [
  BlockIntfType.ActuatorDigitalInterface,
  BlockIntfType.ProcessValueInterface,
];

export default defineComponent({
  name: 'ActuatorLogicFull',
  setup() {
    const {
      serviceId,
      block,
      saveBlock,
      sparkModule,
    } = useBlockWidget.setup<ActuatorLogicBlock>();
    const localExpression = ref<string | null>(null);
    const delayedSave = ref<number | null>(null);

    function commit(): void {
      if (localExpression.value !== null) {
        block.value.data.expression = localExpression.value;
        saveBlock(block.value);
      }
    }

    function saveExpression(expr: string | null): void {
      if (delayedSave.value !== null) {
        clearTimeout(delayedSave.value);
      }
      localExpression.value = expr ?? '';
      delayedSave.value = window.setTimeout(commit, 1000);
    }

    onBeforeUnmount(() => {
      if (delayedSave.value !== null) {
        clearTimeout(delayedSave.value);
        commit();
      }
    });

    const validBlocks = computed<Block[]>(
      () => sparkModule.blocks
        .filter(block => isCompatible(block.type, validTypes)),
    );

    const expression = computed<string>(
      () => localExpression.value ?? block.value.data.expression,
    );

    const characters = computed<{ char: string, pretty: string }[]>(
      () => '()!&|^'
        .split('')
        .map(char => ({ char, pretty: characterTitles[char] ?? char })),
    );

    const digital = computed<{ key: string; cmp: DigitalCompare; pretty: string }[]>(
      () => block.value.data.digital
        .map((cmp, idx) => ({
          cmp,
          key: digitalKey(idx),
          pretty: prettyDigital(cmp),
        })),
    );

    const analog = computed<{ key: string; cmp: AnalogCompare; pretty: string }[]>(
      () => block.value.data.analog
        .map((cmp, idx) => ({
          cmp,
          key: analogKey(idx),
          pretty: prettyAnalog(
            cmp,
            sparkModule.blockById(cmp.id.id)?.type ?? null,
          ),
        })),
    );

    const firmwareError = computed<ExpressionError | null>(
      () => {
        const { result, errorPos } = block.value.data;
        const index = Math.max(0, errorPos - 1);
        return nonErrorResults.includes(result)
          ? null
          : {
            index,
            message: logicResultTitles[result],
            indicator: '-'.repeat(index) + '^',
          };
      },
    );

    const err = computed<ExpressionError | null>(
      () => syntaxCheck(expression.value)
        ?? comparisonCheck(block.value.data)
        ?? (localExpression.value === null ? firmwareError.value : null),
    );

    function addComparison(compared: Block): void {
      if (isCompatible(compared.type, BlockIntfType.ActuatorDigitalInterface)) {
        block.value.data.digital.push({
          op: DigitalCompareOp.OP_VALUE_IS,
          id: bloxLink(compared.id, compared.type),
          rhs: DigitalState.STATE_ACTIVE,
          result: LogicResult.RESULT_EMPTY,
        });
      }
      else if (isCompatible(compared.type, BlockIntfType.ProcessValueInterface)) {
        block.value.data.analog.push({
          op: AnalogCompareOp.OP_VALUE_GE,
          id: bloxLink(compared.id, compared.type),
          rhs: 25,
          result: LogicResult.RESULT_EMPTY,
        });
      }
      saveBlock();
    }

    function editDigital(key: string, cmp: DigitalCompare): void {
      createDialog({
        component: DigitalCompareEditDialog,
        componentProps: {
          modelValue: cmp,
          serviceId,
          title: 'Edit comparison',
        },
      })
        .onOk(cmp => {
          block.value.data.digital.splice(digitalIdx(key), 1, cmp);
          saveBlock();
        });
    }

    function editAnalog(key: string, cmp: AnalogCompare): void {
      createDialog({
        component: AnalogCompareEditDialog,
        componentProps: {
          serviceId,
          title: 'Edit comparison',
          modelValue: cmp,
        },
      })
        .onOk(cmp => {
          block.value.data.analog.splice(analogIdx(key), 1, cmp);
          saveBlock();
        });
    }

    function removeDigital(key: string): void {
      block.value.data.digital.splice(digitalIdx(key), 1);
      block.value.data.expression = shiftRemainingComparisons(expression.value, key);
      saveBlock();
    }

    function removeAnalog(key: string): void {
      block.value.data.analog.splice(analogIdx(key), 1);
      block.value.data.expression = shiftRemainingComparisons(expression.value, key);
      saveBlock();
    }

    return {
      prettyLink,
      serviceId,
      block,
      saveBlock,
      validBlocks,
      saveExpression,
      expression,
      err,
      digital,
      editDigital,
      removeDigital,
      analog,
      editAnalog,
      removeAnalog,
      characters,
      addComparison,
    };
  },
});
</script>
<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body">
      <q-input
        :model-value="expression"
        label="Expression"
        title="Expression"
        item-aligned
        clearable
        placeholder="(a|b)&amp;(c^d)&amp;!e"
        type="text"
        class="expression-editor"
        @update:model-value="saveExpression"
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

      <div
        class="error-indicator q-pa-md text-negative"
        :style="{visibility: err ? '' : 'hidden'}"
      >
        <div>{{ expression }}</div>
        <div>{{ err ? err.indicator : '---' }}</div>
        <div>{{ err ? err.message : '---' }}</div>
      </div>

      <LabeledField
        label="Active comparisons"
        tag-class="col-grow"
      >
        <div class="row q-gutter-xs col-grow">
          <q-chip
            v-for="{key, cmp, pretty} in digital"
            :key="`digital-${key}`"
            removable
            clickable
            class="hoverable full-width"
            color="blue-grey-8"
            @click="editDigital(key, cmp)"
            @remove="removeDigital(key)"
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
              <q-tooltip>
                {{ prettyLink(cmp.id) }} [{{ pretty }}]
              </q-tooltip>
            </div>
          </q-chip>
          <q-chip
            v-for="{key, cmp, pretty} in analog"
            :key="`analog-${key}`"
            removable
            clickable
            class="hoverable full-width"
            color="blue-grey-8"
            @click="editAnalog(key, cmp)"
            @remove="removeAnalog(key)"
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
              <q-tooltip>
                {{ prettyLink(cmp.id) }} [{{ pretty }}]
              </q-tooltip>
            </div>
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
            clickable
            @click="saveExpression(block.data.expression + char)"
          >
            {{ char }}
            <q-tooltip>{{ pretty }}</q-tooltip>
          </q-chip>
          <q-chip
            v-for="{key, cmp, pretty} in digital"
            :key="`digital-add-${key}`"
            class="hoverable text-bold"
            color="blue-grey-8"
            text-color="lime-6"
            clickable
            @click="saveExpression(block.data.expression + key)"
          >
            {{ key }}
            <q-tooltip>{{ prettyLink(cmp.id) }} [{{ pretty }}]</q-tooltip>
          </q-chip>
          <q-chip
            v-for="{key, cmp, pretty} in analog"
            :key="`analog-add-${key}`"
            class="hoverable text-bold"
            color="blue-grey-8"
            text-color="orange-6"
            clickable
            @click="saveExpression(block.data.expression + key)"
          >
            {{ key }}
            <q-tooltip>{{ prettyLink(cmp.id) }} [{{ pretty }}]</q-tooltip>
          </q-chip>
        </div>
      </LabeledField>

      <LabeledField label="Add comparison based on">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="block in validBlocks"
            :key="`block-${block.id}`"
            class="hoverable"
            color="blue-grey-8"
            clickable
            @click="addComparison(block)"
          >
            {{ block.id }}
          </q-chip>
        </div>
      </LabeledField>

      <LinkField
        :model-value="block.data.targetId"
        :service-id="serviceId"
        title="Digital Actuator target"
        label="Digital Actuator target"
        @update:model-value="v => { block.data.targetId = v; saveBlock(); }"
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
