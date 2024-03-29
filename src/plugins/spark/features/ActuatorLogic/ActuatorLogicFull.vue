<script setup lang="ts">
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
} from 'brewblox-proto/ts';
import { computed, onBeforeUnmount, ref } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_LOGIC_RESULT } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { isCompatible } from '@/plugins/spark/utils/info';
import { createComponentDialog } from '@/utils/dialog';
import { bloxLink } from '@/utils/link';
import { nonNullString, prettyLink } from '@/utils/quantity';
import AnalogCompareEditDialog from './AnalogCompareEditDialog.vue';
import { characterTitles, nonErrorResults } from './const';
import DigitalCompareEditDialog from './DigitalCompareEditDialog.vue';
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
  BlockIntfType.DigitalInterface,
  BlockIntfType.ProcessValueInterface,
];

const sparkStore = useSparkStore();
const { serviceId, block, patchBlock } =
  useBlockWidget.setup<ActuatorLogicBlock>();
const localExpression = ref<string | null>(null);
const delayedSave = ref<number | null>(null);

function commit(): void {
  if (localExpression.value != null) {
    patchBlock({ expression: localExpression.value });
  }
}

function saveExpression(expr: string | number | null): void {
  if (delayedSave.value !== null) {
    clearTimeout(delayedSave.value);
  }
  localExpression.value = nonNullString(expr);
  delayedSave.value = window.setTimeout(commit, 1000);
}

onBeforeUnmount(() => {
  if (delayedSave.value !== null) {
    clearTimeout(delayedSave.value);
    commit();
  }
});

const validBlocks = computed<Block[]>(() =>
  sparkStore
    .blocksByService(serviceId)
    .filter((block) => isCompatible(block.type, validTypes)),
);

const expression = computed<string>(
  () => localExpression.value ?? block.value.data.expression,
);

const characters = computed<{ char: string; pretty: string }[]>(() =>
  '()!&|^'
    .split('')
    .map((char) => ({ char, pretty: characterTitles[char] ?? char })),
);

const digital = computed<
  { key: string; cmp: DigitalCompare; pretty: string }[]
>(() =>
  block.value.data.digital.map((cmp, idx) => ({
    cmp,
    key: digitalKey(idx),
    pretty: prettyDigital(cmp),
  })),
);

const analog = computed<{ key: string; cmp: AnalogCompare; pretty: string }[]>(
  () =>
    block.value.data.analog.map((cmp, idx) => ({
      cmp,
      key: analogKey(idx),
      pretty: prettyAnalog(
        cmp,
        sparkStore.blockById(serviceId, cmp.id.id)?.type ?? null,
      ),
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
    syntaxCheck(expression.value) ??
    comparisonCheck(block.value.data) ??
    (localExpression.value == null ? firmwareError.value : null),
);

function addComparison(compared: Block): void {
  if (isCompatible(compared.type, BlockIntfType.DigitalInterface)) {
    patchBlock({
      digital: [
        ...block.value.data.digital,
        {
          op: DigitalCompareOp.OP_VALUE_IS,
          id: bloxLink(compared.id, compared.type),
          rhs: DigitalState.STATE_ACTIVE,
          result: LogicResult.RESULT_EMPTY,
        },
      ],
    });
  } else if (isCompatible(compared.type, BlockIntfType.ProcessValueInterface)) {
    patchBlock({
      analog: [
        ...block.value.data.analog,
        {
          op: AnalogCompareOp.OP_VALUE_GE,
          id: bloxLink(compared.id, compared.type),
          rhs: 25,
          result: LogicResult.RESULT_EMPTY,
        },
      ],
    });
  }
}

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
      serviceId,
      title: 'Edit comparison',
      modelValue: cmp,
    },
  }).onOk((cmp) => {
    const analog = [...block.value.data.analog];
    analog[analogIdx(key)] = cmp;
    patchBlock({ analog });
  });
}

function removeDigital(key: string): void {
  const { digital } = block.value.data;
  const removedIdx = digitalIdx(key);
  patchBlock({
    digital: digital.filter((_, idx) => idx !== removedIdx),
    expression: shiftRemainingComparisons(expression.value, key),
  });
}

function removeAnalog(key: string): void {
  const { analog } = block.value.data;
  const removedIdx = analogIdx(key);
  patchBlock({
    analog: analog.filter((_, idx) => idx !== removedIdx),
    expression: shiftRemainingComparisons(expression.value, key),
  });
}
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
            @click="
              saveExpression(expression.substring(0, expression.length - 1))
            "
          />
        </template>
      </q-input>

      <div
        class="error-indicator q-pa-md text-negative"
        :style="{ visibility: err ? 'inherit' : 'hidden' }"
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
            v-for="{ key, cmp, pretty } in digital"
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
              <q-tooltip> {{ prettyLink(cmp.id) }} [{{ pretty }}] </q-tooltip>
            </div>
          </q-chip>
          <q-chip
            v-for="{ key, cmp, pretty } in analog"
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
              <q-tooltip> {{ prettyLink(cmp.id) }} [{{ pretty }}] </q-tooltip>
            </div>
          </q-chip>
        </div>
      </LabeledField>

      <LabeledField label="Add character">
        <div class="row wrap q-gutter-xs">
          <q-chip
            v-for="{ char, pretty } in characters"
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
            v-for="{ key, cmp, pretty } in digital"
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
            v-for="{ key, cmp, pretty } in analog"
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
            v-for="compBlock in validBlocks"
            :key="`block-${compBlock.id}`"
            class="hoverable"
            color="blue-grey-8"
            clickable
            @click="addComparison(compBlock)"
          >
            {{ compBlock.id }}
          </q-chip>
        </div>
      </LabeledField>

      <LinkField
        :model-value="block.data.targetId"
        :service-id="serviceId"
        title="Digital Actuator target"
        label="Digital Actuator target"
        @update:model-value="(v) => patchBlock({ targetId: v })"
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
