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
import {
  ENUM_LABELS_DERIVATIVE_FILTER_CHOICE,
  ENUM_LABELS_FILTER_CHOICE,
} from '@/plugins/spark/const';
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

const ambientBlock = computed<Block | null>(() =>
  sparkStore.blockByLink(serviceId, block.value.data.ambientId),
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

function showInput(): void {
  createBlockDialog(inputBlock.value);
}

function showOutput(): void {
  createBlockDialog(outputBlock.value);
}

function showAmbient(): void {
  createBlockDialog(ambientBlock.value);
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
                A longer delay will surpress quick fluctuations more,
                but too much delay can cause D to be out of sync with P.
                When you choose <b>Derived from Td</b>, a filter is selected automatically to
                have less than Td delay until max derivative.
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
              <p>A PID block sets its target setting to regulate its input value.</p>
              <p>
                This input is a ProcessValue:
                something that has a target setting and an measured value.
                In most cases, the input will be a Setpoint block.
              </p>
              <p>The input setting minus the input value is called the error</p>
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
              <p>The ambient sensor block provides the ambient temperature.
                This value is used in the feed forward calculation.
                </p>
              <p>
                Feed forward is added to the output indepedent of the input sensor.
                It is calculated from the input setting and the ambient temperature instead.
                The offset between the setting and the ambient temperature is multiplied
                by the feed forward gain.
              </p>
              <p>
                By using a feed forward gain, the PID does not have to rely on just the integral
                to overcome the effect of ambient temperature and can compensate for it faster.
              </p>
              <p>
                The ambient temperature is smoothed with a time constant in the order of Ti.
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
      <div class="flex-center calculation grid-container q-pa-md">
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
                  The I part of PID, the integrator, is for removing steady state errors.
                  The integrator slowly builds up when the error is not zero by accumulating P,
                  until the target is reached and P is zero.
                </p>
                <p>
                  I increases with P / Ti every second.
                  Ti should be long enough so I does not increase much during a step change,
                  where P should bring the output to the target.
                </p>
                <p>
                  A good guess for Ti is: <br/>
                  at least 3x the time between the output dipping under 100%
                  and reaching the setpoint on a step.
                </p>
                <p>
                  When you have overshoot due to I, it can have 2 reasons:
                  <ul>
                    <li> Ti is too short, so I increases too fast. </li>
                    <li> Kp is too low,
                       which makes I the main driver of the output instead of P. </li>
                  </ul>
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
          class="span-m clickable row items-center full-height"
          @click="startEditIValue"
        >
          <div class="big i-parts text-right q-pr-sm full-width">
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
                The D part of PID, the derivative, has the opposite sign of P.
                When the input is approaching the target quickly,
                it will reduce the output to avoid overshoot.
              </p>
              <p>
                Td is the derivative time constant.
                A good starting point for Td is
                the time between when the output is 0% and when the overshoot peaks.
              </p>
              <p>
                When there is little overshoot in the system, Td is best kept at zero.
                D is clipped to +/- P to avoid oscillations.
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

        <div class="span-m row items-center full-height">
          <div class="big d-parts text-right q-pr-sm full-width">
            {{ fixedNumber(block.data.d) }}
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
            message="
              <p>
                Kff is the feed forward gain.
              </p>
              <p>
                The feed forward part (FF) is added to the output,
                 to compensate for ambient temperature.
                </p>
                <p>
                FF = Kff * (input setting - ambient temperature).
                </p>
                <p>
                  When you change Kff, the integral will be modified to keep the output the same.
                  You can click the I part to set it manually.
                </p>
              "
            borderless
            @update:model-value="(kff) => patchBlock({ kff })"
          />
        </div>

        <div class="span-s text-center big">=</div>

        <div class="span-m row items-center full-height">
          <div class="big ff-parts text-right q-pr-sm full-width">
            {{ fixedNumber(block.data.ff) }}
          </div>
        </div>

        <div class="span-s" />
        <div class="span-s" />
        <div class="span-l" />
        <div class="span-s" />
        <div class="span-l big row q-mt-md">
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
            {{
              fixedNumber(
                block.data.p + block.data.i + block.data.d + block.data.ff,
              )
            }}
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
        When the Setpoint is set to this temperature or higher,
      the output of the PID will stay above the configured miniumum for boiling.
      "
          />
        </div>
      </div>
      <q-separator class="q-ma-xs" />
      <div
        v-if="inputFilter !== null"
        class="row items-center justify-center q-pa-sm"
      >
        <div class="col-auto">
          <span>The input has a smoothing filter with </span>
          <span
            class="clickable q-pa-sm q-ma-xs rounded-borders text-bold"
            style="line-height: 200%"
            @click="showInput"
          >
            {{ ENUM_LABELS_FILTER_CHOICE[inputFilter] }}
          </span>
        </div>
      </div>
      <div class="row items-center justify-center q-pa-sm">
        <div class="col-auto">
          <span
            >The derivative has a smoothing filter
            {{
              block.data.derivativeFilterChoice === FilterChoice.FILTER_NONE
                ? ''
                : 'with'
            }}</span
          >
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
            which has
            {{
              ENUM_LABELS_DERIVATIVE_FILTER_CHOICE[block.data.derivativeFilter]
            }}
          </template>
          <template v-else> </template>
        </div>
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
