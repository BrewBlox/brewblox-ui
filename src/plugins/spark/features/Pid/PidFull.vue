<script setup lang="ts">
import {
  ActuatorOffsetBlock,
  Block,
  BlockType,
  FilterChoice,
  PidBlock,
  Quantity,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';
import { ENUM_LABELS_DERIVATIVE_FILTER_CHOICE } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { prettyBlock } from '@/plugins/spark/utils/formatting';
import { isBlockClaimed } from '@/plugins/spark/utils/info';
import { createBlockDialog } from '@/utils/block-dialog';
import { selectable } from '@/utils/collections';
import { createDialog } from '@/utils/dialog';
import { matchesType } from '@/utils/objects';
import {
  bloxQty,
  durationMs,
  durationString,
  fixedNumber,
  prettyQty,
  tempQty,
} from '@/utils/quantity';

const sparkStore = useSparkStore();
const { serviceId, block, patchBlock } = useBlockWidget.setup<PidBlock>();

const derivativeFilterOpts = selectable(ENUM_LABELS_DERIVATIVE_FILTER_CHOICE);

const inputBlock = computed<SetpointSensorPairBlock | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.inputId),
);

const inputClaimed = computed<boolean>(() =>
  isBlockClaimed(inputBlock.value, sparkStore.claims),
);

const inputStoredSetting = computed<Quantity | null>({
  get: () => inputBlock.value?.data.storedSetting ?? null,
  set: (q) => {
    if (inputBlock.value && q) {
      sparkStore.patchBlock(inputBlock.value, { storedSetting: q });
    }
  },
});

const outputBlock = computed<Block | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.outputId),
);

const offsetOutput = computed<boolean>(() =>
  matchesType<ActuatorOffsetBlock>(BlockType.ActuatorOffset, outputBlock.value),
);

const boiling = computed<boolean>(() => block.value.data.boilModeActive);

const waterBoilTemp = computed<Quantity>(() => tempQty(100));

const boilPoint = computed<Quantity>({
  get: () => {
    const qty = bloxQty(block.value.data.boilPointAdjust);
    qty.value = (qty.value ?? 0) + waterBoilTemp.value.value!;
    return qty;
  },
  set: (qty) => {
    if (qty.value != null) {
      qty.value -= waterBoilTemp.value.value!;
    } else {
      qty.value = 0;
    }
    patchBlock({ boilPointAdjust: qty });
  },
});

const boilMinOutputQty = computed<Quantity>({
  get: () =>
    offsetOutput.value
      ? tempQty(block.value.data.boilMinOutput)
      : bloxQty(block.value.data.boilMinOutput, '%'),
  set: (qty) => {
    const numV = offsetOutput.value ? bloxQty(qty).to('degC').value : qty.value;
    patchBlock({ boilMinOutput: numV ?? 0 });
  },
});

function showInput(): void {
  createBlockDialog(inputBlock.value);
}

function showOutput(): void {
  createBlockDialog(outputBlock.value);
}

function startEditIValue(): void {
  createDialog({
    component: 'NumberDialog',
    componentProps: {
      modelValue: block.value.data.i ?? 0,
      title: 'Override I part of PID',
      message: `
                <p>
                  The integrator slowly builds up when the error is not zero.
                  If you don't want to wait for that,
                  you can manually set the integral part of the output here.
                </p>
                <p>
                  It will continue to adjust automatically afterwards.
                </p>
                `,
      html: true,
    },
  }).onOk((v: number) => patchBlock({ integralReset: v || 0.001 }));
}

function openDerivativeFilterDialog(): void {
  createDialog({
    component: 'SelectDialog',
    componentProps: {
      modelValue: block.value.data.derivativeFilterChoice,
      title: 'Derivative filter delay',
      message: `
              <p>
                The derivative is calculated from filtered input to reduce
                the effect of noise and limited sensor resolution.
              </p>
              <p>
                A longer delay will surpress derivative output from small sensor changes,
                but can result in the D part of the PID being too late to counteract P.
              </p>
              `,
      html: true,
      selectOptions: derivativeFilterOpts,
      selectProps: {
        label: 'Filter delay',
      },
    },
  }).onOk((v) => patchBlock({ derivativeFilterChoice: v }));
}
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row">
      <!-- Input row -->
      <LinkField
        :model-value="block.data.inputId"
        :service-id="serviceId"
        :show="false"
        title="Input"
        label="Input Block"
        html
        message="
              <p>A PID block sets its target setting to regulate its input value.</p>
              <p>
                This input is a ProcessValue:
                something that has a target setting and an measured value.
                In most cases, the input will be a Setpoint block.
              </p>
              <p>The input setting minus the input value is called the error</p>
              "
        class="col-grow"
        @update:model-value="(v) => patchBlock({ inputId: v })"
      />
      <div class="col-grow">
        <QuantityField
          v-if="inputBlock != null && inputStoredSetting != null"
          v-model="inputStoredSetting"
          :readonly="inputClaimed"
          :class="[{ darkened: !inputBlock.data.enabled }, 'col']"
          label="Setting"
          tag="b"
        />
        <QuantityField
          v-else
          :model-value="block.data.inputSetting"
          label="Setting"
          tag="b"
          readonly
        />
      </div>
      <QuantityField
        :model-value="block.data.inputValue"
        label="Measured"
        tag="b"
        class="col-grow"
        readonly
      />
      <q-btn
        v-if="!!inputBlock"
        flat
        icon="mdi-launch"
        class="col-auto depth-1"
        @click="showInput"
      >
        <q-tooltip>Edit {{ prettyBlock(inputBlock) }}</q-tooltip>
      </q-btn>
      <q-btn
        v-else
        disable
        flat
        class="col-auto"
        icon="mdi-cancel"
      />

      <!-- Output row -->
      <div class="col-break" />

      <LinkField
        :model-value="block.data.outputId"
        :service-id="serviceId"
        :show="false"
        title="Output"
        label="Output Block"
        html
        message="
              <p>The PID sets its output block setting to the result from the PID calculation.</p>
              <p>
                The output value is the sum of 3 parts derived from the input error:
                Proportional, Integral and Derivative.
              </p>
              <p>
                The output block is an 'analog' actuator.
                The analog actuator may in turn set the setting for a digital actuator.
              </p>
              "
        class="col-grow"
        @update:model-value="(v) => patchBlock({ outputId: v })"
      />
      <LabeledField
        :model-value="block.data.outputSetting"
        number
        label="Desired value"
        tag="b"
        class="col-grow"
      />
      <LabeledField
        :model-value="block.data.outputValue"
        number
        label="Achieved value"
        tag="b"
        class="col-grow"
      />
      <q-btn
        v-if="!!outputBlock"
        flat
        icon="mdi-launch"
        class="col-auto depth-1"
        @click="showOutput"
      >
        <q-tooltip>Edit {{ prettyBlock(outputBlock) }}</q-tooltip>
      </q-btn>
      <q-btn
        v-else
        disable
        flat
        icon="mdi-cancel"
        class="col-auto"
      />
    </div>

    <q-separator inset />

    <!-- Calculation -->

    <div class="flex-center calculation grid-container q-pa-lg">
      <div class="span-s big p-parts">P</div>
      <div class="span-s big">=</div>
      <div class="span-l">
        <LabeledField label="Error">
          <q-tooltip> Error = setting - measured </q-tooltip>
          {{ prettyQty(block.data.error) }}
        </LabeledField>
      </div>

      <div class="span-s big">&#xd7;</div>

      <div class="span-l">
        <QuantityField
          :model-value="block.data.kp"
          :html="true"
          title="Proportional gain Kp"
          label="Kp"
          message="
              <p>
                Kp is the proportional gain, which is directly mutiplied by the error.
                The output of the PID is Kp * input error.
                Set it to what you think the output should be for a 1 degree error.
              </p>
              <p>Kp should be negative if the actuator brings down the input, like a cooler.</p>
              "
          borderless
          @update:model-value="(kp) => patchBlock({ kp })"
        />
      </div>

      <div class="span-s text-center big">=</div>

      <div class="span-m">
        <div class="big p-parts">
          {{ fixedNumber(block.data.p) }}
        </div>
      </div>

      <div class="span-s big i-parts">I</div>
      <div class="span-s big">=</div>
      <div class="span-l">
        <LabeledField label="Integral of P">
          {{ fixedNumber(block.data.integral) }}
          <q-tooltip>
            Increases with P every second when desired output is achieved
          </q-tooltip>
        </LabeledField>
      </div>

      <div class="span-s big">&#247;</div>

      <div class="span-l">
        <DurationField
          :model-value="block.data.ti"
          :rules="[
            (v) => v >= 0 || 'Value must be positive',
            (v) =>
              v < 2 ** 16 * 1000 ||
              'Value is too large to be stored in firmware',
          ]"
          :html="true"
          title="Integral time constant Ti"
          label="Ti"
          message="
                <p>
                  The purpose of the integrator is to remove steady state errors.
                  The integrator slowly builds up when the error is not zero.
                </p>
                <p>
                  When the proportional action (P) brings the input close
                  to the desired value but a small error remains,
                  the integrator will correct it over time.
                  The integratal increases by P every second.
                  I, which is integral/Ti, will increase by P in Ti seconds.
                </p>
                <p>
                  The integrator should be slow enough
                  to give the process time to respond to proportional action (P).
                  Overshoot due to too much integrator action is usually a sign of Kp being too low.
                </p>
                <p>Setting Ti to zero will disable the integrator.</p>
                "
          borderless
          @update:model-value="(ti) => patchBlock({ ti })"
        >
          <template #value>
            <span>{{ durationMs(block.data.ti) / 1000 }} </span>
            <span class="darkish q-ml-sm"
              >({{ durationString(block.data.ti) }})</span
            >
          </template>
        </DurationField>
      </div>

      <div class="span-s text-center big">=</div>

      <div
        class="span-m clickable row items-center full-height q-my-md"
        @click="startEditIValue"
      >
        <div class="col big i-parts">
          {{ fixedNumber(block.data.i) }}
        </div>
      </div>

      <div class="span-s big d-parts">D</div>
      <div class="span-s big">=</div>
      <div class="span-l">
        <LabeledField
          :tag-class="{ darkish: block.data.td.value === 0 }"
          label="Derivative of P"
        >
          {{ fixedNumber(block.data.derivative, 4) }}
          <q-tooltip> Filtered change of P per second </q-tooltip>
        </LabeledField>
      </div>

      <div class="span-s big">&#xd7;</div>

      <div class="span-l">
        <DurationField
          :model-value="block.data.td"
          :rules="[
            (v) => v >= 0 || 'Value must be positive',
            (v) =>
              v < 2 ** 16 * 1000 ||
              'Value is too large to be stored in firmware',
          ]"
          :html="true"
          title="Derivative time constant Td"
          label="Td"
          message="
              <p>
                When the input is approaching its target fast,
                the derivative action (D) can counteract the proportional action (P).
                This slows down the approach to avoid overshoot.
              </p>
              <p>
                Td is the derivative time constant.
                It should be equal to how long it takes for the process
                to stabilize after you turn off the actuator.
              </p>
              <p>
                When there is no overshoot in the system, Td should be set to zero.
              </p>
              "
          borderless
          @update:model-value="(td) => patchBlock({ td })"
        >
          <template #value>
            <span>{{ durationMs(block.data.td) / 1000 }} </span>
            <span class="darkish q-ml-sm"
              >({{ durationString(block.data.td) }})</span
            >
          </template>
        </DurationField>
      </div>
      <div class="span-s text-center big">=</div>

      <div class="span-m big d-parts">
        {{ fixedNumber(block.data.d) }}
      </div>
    </div>

    <div class="items-center result">
      <div class="row q-mb-md q-gutter-x-md">
        <div class="col-auto big p-parts">
          {{ fixedNumber(block.data.p) }}
        </div>
        <div class="col-auto text-center big">&#x2b;</div>
        <div class="col-auto big i-parts">
          {{ fixedNumber(block.data.i) }}
        </div>
        <div class="col-auto text-center big">&#x2b;</div>
        <div class="col-auto big d-parts">
          {{ fixedNumber(block.data.d) }}
        </div>
        <div class="col-auto text-center big">=</div>
        <div class="col-auto big">
          {{ fixedNumber(block.data.p + block.data.i + block.data.d) }}
        </div>
      </div>
    </div>

    <q-separator inset />

    <div class="row items-center justify-center boil q-pa-md q-gutter-y-sm">
      <div class="col-auto">
        <span>Boil mode keeps the output above </span>
        <InlineQuantityField
          v-model="boilMinOutputQty"
          :class="{ 'text-green': boiling }"
          title="Minimum output when boiling"
        />
      </div>

      <div class="col-auto">
        <span>when the setpoint is above</span>
        <InlineQuantityField
          v-model="boilPoint"
          :class="{ 'text-green': boiling }"
          title="Boiling point"
          message="
        When the Setpoint is set to this temperature or higher,
      the output of the PID will stay above the configured miniumum for boiling.
      "
        />
      </div>
    </div>
    <q-separator inset />
    <div class="row items-center justify-center boil q-pa-md q-gutter-y-sm">
      <div class="col-auto">
        <span>Derivative filter delay is </span>
        <span
          class="clickable q-pa-sm q-ma-xs rounded-borders text-bold"
          style="line-height: 200%"
          @click="openDerivativeFilterDialog"
        >
          {{
            ENUM_LABELS_DERIVATIVE_FILTER_CHOICE[
              block.data.derivativeFilterChoice
            ]
          }}
        </span>
        <template
          v-if="
            block.data.derivativeFilterChoice === FilterChoice.FILTER_NONE &&
            block.data.derivativeFilter !== FilterChoice.FILTER_NONE
          "
        >
          ({{
            ENUM_LABELS_DERIVATIVE_FILTER_CHOICE[block.data.derivativeFilter]
          }})
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.grid-container
  display: grid
  grid-template-columns: repeat(14, 1fr)
  grid-row-gap: 10px

.span-s
  grid-column: span 1

.span-l
  grid-column: span 4

.span-m
  grid-column: span 2
  padding-left: 7px
  border-radius: 4px

.calc-line
  border-bottom: 2px solid white

.calculation > .row
  justify-content: center

.result > .row
  justify-content: center

.p-parts
  color: $light-blue-7

.i-parts
  color: $deep-orange-5

.d-parts
  color: $pink-5
.big
  font-size: 1.5em

.result .big
  font-size: 2em
</style>
