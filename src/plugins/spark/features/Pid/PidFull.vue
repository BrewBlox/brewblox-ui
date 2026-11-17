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
import { filterLabel } from '@/plugins/spark/const';
import { useSparkStore } from '@/plugins/spark/store';
import { prettyBlock } from '@/plugins/spark/utils/formatting';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { matchesType } from '@/utils/objects';
import {
  bloxQty,
  durationMs,
  durationString,
  fixedNumber,
  prettyQty,
  roundedNumber,
  tempQty,
} from '@/utils/quantity';

const sparkStore = useSparkStore();
const { serviceId, block, patchBlock } = useBlockWidget.setup<PidBlock>();

const inputBlock = computed<SetpointSensorPairBlock | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.inputId),
);

const updateIntervalMs = computed(
  () => inputBlock.value?.data.updateInterval?.value ?? null,
);

const showSmoothGain = computed(() => block.value.data.smoothGain != null);

const ambientBlock = computed<Block | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.ambientId),
);

const inputClaimed = computed<boolean>(
  () => inputBlock.value?.data.claimedBy?.id != null,
);

const inputStoredSetting = computed<Quantity | null>({
  get: () => inputBlock.value?.data.storedSetting ?? null,
  set: (q) => {
    if (inputBlock.value && q) {
      sparkStore.patchBlock(inputBlock.value, { storedSetting: q });
    }
  },
});

const inputFilter = computed<FilterChoice | null>({
  get: () => inputBlock.value?.data.filter ?? null,
  set: (q) => {
    if (inputBlock.value && q) {
      sparkStore.patchBlock(inputBlock.value, { filter: q });
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

const ambientRaw = computed<Quantity>(() =>
  tempQty(ambientBlock.value?.data.value ?? null),
);

// P, I and D are null while the PID input is invalid.
// FF is null without a valid ambient value, and then adds nothing.
// While the ambient is gone, a held FF is inside I, which the sum takes.
const outputSum = computed<number | null>(() => {
  const { p, i, d, ff } = block.value.data;
  return p != null && i != null && d != null ? p + i + d + (ff ?? 0) : null;
});

// While the ambient is gone, the Spark holds FF at its last value inside I and sends no FF
const heldFf = computed<number | null>(() => {
  const { ff, i, integral, ti } = block.value.data;
  if (ff != null || i == null) {
    return null;
  }
  const tiSeconds = durationMs(ti) / 1000;
  const held = i - (tiSeconds ? integral / tiSeconds : 0);
  return roundedNumber(held, 2) !== 0 ? held : null;
});

// The Spark limits D to Kp x the largest recent error, and sends the derivative it limited
const dLimited = computed<boolean>(() => {
  const { d, derivative, td } = block.value.data;
  if (d == null) {
    return false;
  }
  const unlimited = (derivative * durationMs(td)) / 1000;
  return roundedNumber(Math.abs(unlimited) - Math.abs(d), 2) > 0;
});

function showInput(): void {
  createBlockDialog(inputBlock.value);
}

function showOutput(): void {
  createBlockDialog(outputBlock.value);
}

function showAmbient(): void {
  createBlockDialog(ambientBlock.value);
}

const ambientHint = computed<string>(() => {
  const offset = bloxQty(block.value.data.ambientOffset);
  const { i, ff } = block.value.data;
  if (!offset.value || i == null || ff == null) {
    return '';
  }
  const sum = i + ff;
  const suggestedKff = sum / offset.value;
  return `<i>Hint: FF is now ${roundedNumber(block.value.data.ff, 2)} and
   I is ${roundedNumber(block.value.data.i, 2)}.<br>
  A Kff setting of ${roundedNumber(suggestedKff, 2)}
  will make FF ${roundedNumber(sum, 2)} and I zero.</i>`;
});

function startEditIValue(): void {
  createDialog({
    component: 'NumberDialog',
    componentProps: {
      modelValue: block.value.data.i ?? 0,
      title: 'Override I part of PID',
      message: `
                <p>
                  I builds up slowly while the temperature is off the setpoint.
                  To skip the wait, set I here.
                </p>
                <p>
                  It keeps adjusting itself afterwards.
                </p>
                `,
      html: true,
    },
  }).onOk((v: number) => patchBlock({ integralReset: v || 0.001 }));
}
</script>

<template>
  <div>
    <div class="widget-body">
      <div class="col-12 q-mb-md">
        <slot name="warnings" />
      </div>
      <q-separator class="q-ma-sm" />

      <!-- Input row -->
      <div class="row q-ma-sm q-gutter-sm">
        <LinkField
          :model-value="block.data.inputId"
          :service-id="serviceId"
          :show="false"
          title="Input"
          label="Input Block"
          html
          message="
              <p>
                The input is the Setpoint the PID controls.
                It has a setting, the temperature you want,
                and a measured temperature.
              </p>
              <p>
                The PID changes its output to bring the measured temperature to the setting.
                The setting minus the measured temperature is the error.
              </p>
              "
          class="col"
          @update:model-value="(v) => patchBlock({ inputId: v })"
        />
        <div class="col-3">
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
          class="col-3"
          readonly
        />
        <q-btn
          v-if="!!inputBlock"
          flat
          icon="mdi-launch"
          class="col-1 depth-1"
          @click="showInput"
        >
          <q-tooltip>Edit {{ prettyBlock(inputBlock) }}</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          disable
          flat
          class="col-1"
          icon="mdi-cancel"
        />
      </div>

      <!-- Output row -->
      <div class="row q-ma-sm q-gutter-sm">
        <LinkField
          :model-value="block.data.outputId"
          :service-id="serviceId"
          :show="false"
          title="Output"
          label="Output Block"
          html
          message="
              <p>
                The output is the actuator the PID drives, such as a PWM or a Setpoint Driver.
                The PID sets it to the sum of four parts: P, I, D and FF.
              </p>
              <p>
                A PWM in turn switches a digital actuator, such as a heater relay, on and off.
              </p>
              "
          class="col"
          @update:model-value="(v) => patchBlock({ outputId: v })"
        />
        <LabeledField
          :model-value="block.data.outputSetting"
          number
          label="Desired value"
          tag="b"
          class="col-3"
        />
        <LabeledField
          :model-value="block.data.outputValue"
          number
          label="Achieved value"
          tag="b"
          class="col-3"
        />
        <q-btn
          v-if="!!outputBlock"
          flat
          icon="mdi-launch"
          class="col-1 depth-1"
          @click="showOutput"
        >
          <q-tooltip>Edit {{ prettyBlock(outputBlock) }}</q-tooltip>
        </q-btn>
        <q-btn
          v-else
          disable
          flat
          icon="mdi-cancel"
          class="col-1"
        />
      </div>

      <!-- Ambient row -->
      <div class="row q-ma-sm q-gutter-sm q-mb-md">
        <LinkField
          :model-value="block.data.ambientId"
          :service-id="serviceId"
          :show="false"
          title="Ambient temperature for feed forward"
          label="Ambient Block (optional)"
          html
          message="
              <p>
                The ambient sensor measures the temperature around your vessel, such as the room.
              </p>
              <p>
                Feed forward (FF) uses it to add output for the heat lost to the surroundings,
                or gained from them when cooling,
                so the PID does not have to wait for I to build up.
                FF = Kff × (setting - ambient temperature).
              </p>
              <p>
                The PID smooths the ambient temperature over about Ti, and at least 12 seconds.
                If the ambient sensor stops, the PID holds the FF it had until the sensor returns.
              </p>
              "
          class="col"
          @update:model-value="(v) => patchBlock({ ambientId: v })"
        />
        <QuantityField
          :model-value="ambientRaw"
          label="Ambient measured"
          tag="b"
          class="col-3"
          readonly
        />
        <QuantityField
          :model-value="block.data.ambientValue"
          label="Ambient smoothed"
          tag="b"
          class="col-3"
          readonly
        >
        </QuantityField>
        <q-btn
          v-if="!!ambientBlock"
          flat
          icon="mdi-launch"
          class="col-1 depth-1"
          @click="showAmbient"
        >
          <q-tooltip>Edit {{ prettyBlock(ambientBlock) }}</q-tooltip>
        </q-btn>
        <div
          v-else
          class="col-1"
        />
      </div>
      <q-separator class="q-ma-sm" />

      <!-- Calculation -->
      <div
        class="flex-center calculation q-pa-md"
        :class="showSmoothGain ? 'grid-16' : 'grid-14'"
      >
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
                Kp sets how strongly the PID reacts to the error: P = Kp × error.
                Near the setpoint, the smooth band can turn P down.
                Set it to the output you want for a 1 degree error.
              </p>
              <p>Kp is negative when the actuator lowers the temperature, such as a cooler.</p>
              "
            borderless
            @update:model-value="(kp) => patchBlock({ kp })"
          />
        </div>

        <div :class="showSmoothGain ? 'span-s big text-center' : ''">
          {{ showSmoothGain ? '\xd7' : '' }}
        </div>
        <div :class="showSmoothGain ? 'span-l' : ''">
          <LabeledField
            v-if="showSmoothGain"
            label="Smoothing"
          >
            {{ fixedNumber(block.data.smoothGain, 2) }}
          </LabeledField>
        </div>

        <div class="span-s text-center big">=</div>

        <div class="span-m row items-center full-height">
          <div class="big p-parts text-right q-pr-sm full-width">
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
                  I removes the error that P alone leaves.
                  It adds up the error over time:
                  every second, I grows by about Kp × error / Ti,
                  until the temperature reaches the setpoint.
                </p>
                <p>
                  Ti should be long enough that I grows little during a step,
                  which P should handle.
                  A good guess is at least 3 × the time from when the output drops below 100%
                  until the temperature reaches the setpoint.
                </p>
                <p>
                  When I causes overshoot, either Ti is too short, so I grows too fast,
                  or Kp is too low, so I drives the output instead of P.
                </p>
                <p>
                  While the output is missing, disabled, or drives nothing,
                  I does not grow and slowly returns to zero.
                  Set Ti to zero to turn I off.
                </p>
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

        <div :class="showSmoothGain ? 'span-s' : ''" />
        <div :class="showSmoothGain ? 'span-l' : ''" />

        <div class="span-s text-center big">=</div>

        <div
          class="span-m clickable row items-center full-height"
          @click="startEditIValue"
        >
          <div class="big i-parts text-right q-pr-sm full-width">
            {{ fixedNumber(block.data.i) }}
            <div
              v-if="heldFf !== null"
              class="text-caption fade-4"
            >
              incl. held FF
            </div>
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
                D reacts to how fast the temperature changes.
                When it moves quickly toward the setpoint,
                D reduces the output so the temperature does not overshoot.
              </p>
              <p>
                Td sets how strongly D reacts.
                A good starting point for Td is the time from
                when the output turns off to when the overshoot peaks.
                When the temperature barely overshoots, leave Td at zero.
              </p>
              <p>
                D is never larger than Kp × the largest error
                of roughly the last 1.5 × Td.
                This keeps a Td that is set too high from making the output swing.
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

        <div :class="showSmoothGain ? 'span-s' : ''" />
        <div :class="showSmoothGain ? 'span-l' : ''" />

        <div class="span-s text-center big">=</div>

        <div class="span-m row items-center full-height">
          <div class="big d-parts text-right q-pr-sm full-width">
            {{ fixedNumber(block.data.d) }}
            <div
              v-if="dLimited"
              class="text-caption fade-4"
            >
              limited
            </div>
          </div>
        </div>

        <div class="span-s big ff-parts">FF</div>
        <div class="span-s big">=</div>
        <div class="span-l">
          <QuantityField
            :model-value="block.data.ambientOffset"
            label="Offset from ambient"
            class="col-3"
            readonly
          >
          </QuantityField>
        </div>

        <div class="span-s big">&#xd7;</div>

        <div class="span-l">
          <QuantityField
            :model-value="block.data.kff"
            :html="true"
            title="Feed Forward gain Kff"
            label="Kff"
            :message="`
              <p>
                Kff sets how much feed forward (FF) the PID adds
                per degree between the setting and the ambient temperature:
                FF = Kff × (setting - ambient temperature).
              </p>
              <p>
                When you change Kff, I changes the other way, so the output does not jump.
                With I off, at Ti 0 or in boil mode, the output changes with FF.
                You can click I to set it yourself.
              </p>${ambientHint}`"
            borderless
            @update:model-value="(kff) => patchBlock({ kff })"
          />
        </div>

        <div :class="showSmoothGain ? 'span-s' : ''" />
        <div :class="showSmoothGain ? 'span-l' : ''" />

        <div class="span-s text-center big">=</div>

        <div class="span-m row items-center full-height">
          <div class="big ff-parts text-right q-pr-sm full-width">
            <template v-if="heldFf !== null">
              <span class="fade-4">{{ fixedNumber(heldFf) }}</span>
              <q-tooltip>
                The ambient sensor is gone. FF holds its last value, which the
                Spark counts in I until the sensor returns.
              </q-tooltip>
            </template>
            <template v-else>
              {{ fixedNumber(block.data.ff) }}
            </template>
          </div>
        </div>

        <div class="span-s" />
        <div class="span-l" />
        <div class="span-s" />
        <div :class="showSmoothGain ? 'span-s' : ''" />
        <div :class="showSmoothGain ? 'span-l' : ''" />
        <div class="span-4 big row no-wrap q-mt-md justify-end">
          <div class="p-parts">P</div>
          <div class="q-mx-sm">+</div>
          <div class="i-parts">I</div>
          <div class="q-mx-sm">+</div>
          <div class="d-parts">D</div>
          <div class="q-mx-sm">+</div>
          <div class="ff-parts">FF</div>
        </div>
        <div class="span-s text-center big q-mt-md">=</div>
        <div class="span-m row items-center full-height summed">
          <div class="big text-right q-pr-sm q-mt-md full-width">
            {{ fixedNumber(outputSum) }}
          </div>
        </div>
      </div>

      <q-separator />

      <div class="row items-center justify-center boil q-pa-sm">
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
              When the setpoint is at this temperature or higher,
              the PID keeps its output at least at the minimum for boiling.
              I is off in boil mode.
            "
          />
        </div>
      </div>
      <q-separator class="q-ma-xs" />
      <div class="row items-center justify-center q-pa-sm">
        <div class="col-auto">
          <span>Suppress P and D when temperature stays within </span>
          <InlineQuantityField
            :model-value="block.data.smoothBand"
            title="Smooth band"
            html
            message="
              <p>
                When the temperature is steady near the setpoint, I does most of the work.
                The smooth band then slowly turns P and D down,
                so they do not react to sensor noise.
                When the temperature moves away, they turn back up quickly.
                When I itself starts to swing the temperature,
                P and D get their gain back, so the band doesn't make the loop cycle.
              </p>
              <p>
                P and D turn down over about Ti.
                Set the band to 2-3 × the noise on your sensor; the default is 0.25 °C.
                Set it to 0 to turn smoothing off.
              </p>
              "
            @update:model-value="(v) => patchBlock({ smoothBand: v })"
          />
          <span> of the setpoint (smooth band)</span>
        </div>
      </div>
      <q-separator class="q-ma-xs" />
      <div
        v-if="inputFilter !== null"
        class="row items-center justify-center q-pa-sm"
      >
        <div class="col-auto">
          <span>The input has a low-pass filter with a delay of </span>
          <span
            class="clickable q-pa-sm q-ma-xs rounded-borders text-bold"
            style="line-height: 200%"
            @click="showInput"
          >
            {{ filterLabel(inputFilter, updateIntervalMs) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.grid-14
  display: grid
  grid-template-columns: repeat(14, 1fr)
  grid-row-gap: 10px

.grid-16
  display: grid
  grid-template-columns: repeat(16, 1fr)
  grid-row-gap: 10px

.span-s
  grid-column: span 1

.span-l
  grid-column: span 3

.span-4
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

.ff-parts
  color: $purple-5

.big
  font-size: 1.5em

.result .big
  font-size: 2em
.summed
  border-top: 2px solid $grey-3
  border-radius: 0
</style>
