<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { prettyBlock } from '@/plugins/spark/utils/formatting';
import { isBlockClaimed } from '@/plugins/spark/utils/info';
import { createBlockDialog } from '@/utils/block-dialog';
import { matchesType } from '@/utils/objects';
import { bloxQty, fixedNumber, prettyQty, tempQty } from '@/utils/quantity';
import {
  ActuatorOffsetBlock,
  Block,
  BlockType,
  PidBlock,
  Quantity,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

interface GridOpts {
  start?: number;
  span?: number;
}

export default defineComponent({
  name: 'PidFull',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, block, patchBlock } = useBlockWidget.setup<PidBlock>();

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
      matchesType<ActuatorOffsetBlock>(
        BlockType.ActuatorOffset,
        outputBlock.value,
      ),
    );

    const baseOutput = computed<number>(() => {
      const { p, i, d } = block.value.data;
      return p + i + d;
    });

    const boiling = computed<boolean>(() => block.value.data.boilModeActive);

    const boilAdjustment = computed<number>(() =>
      boiling.value ? block.value.data.boilMinOutput - baseOutput.value : 0,
    );

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
        const numV = offsetOutput.value
          ? bloxQty(qty).to('degC').value
          : qty.value;
        patchBlock({ boilMinOutput: numV ?? 0 });
      },
    });

    function showInput(): void {
      createBlockDialog(inputBlock.value);
    }

    function showOutput(): void {
      createBlockDialog(outputBlock.value);
    }

    function grid(opts: GridOpts): Mapped<string> {
      return {
        gridColumnStart: `${opts.start || 'auto'}`,
        gridColumnEnd: `span ${opts.span || 1}`,
      };
    }

    return {
      prettyBlock,
      prettyQty,
      fixedNumber,
      serviceId,
      block,
      patchBlock,
      inputBlock,
      inputClaimed,
      inputStoredSetting,
      outputBlock,
      baseOutput,
      boiling,
      boilAdjustment,
      boilMinOutputQty,
      boilPoint,
      showInput,
      showOutput,
      grid,
    };
  },
});
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
        label="Target value"
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

    <!-- Calculation grid -->
    <div class="widget-body items-center grid-container">
      <div class="span-2">
        <LabeledField label="Error">
          {{ prettyQty(block.data.error) }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">*</div>

      <div class="span-2">
        <QuantityField
          :model-value="block.data.kp"
          :html="true"
          title="Proportional gain Kp"
          label="Kp"
          message="
              <p>
                Kp is the proportional gain, which is directly mutiplied by the filtered error.
                The output of the PID is Kp * input error.
                Set it to what you think the output should be for a 1 degree error.
              </p>
              <p>Kp should be negative if the actuator brings down the input, like a cooler.</p>
              "
          borderless
          @update:model-value="(kp) => patchBlock({ kp })"
        />
      </div>

      <div
        :style="grid({ start: 9 })"
        class="self-center text-center"
      >
        =
      </div>

      <div class="span-2">
        <LabeledField label="P">
          {{ fixedNumber(block.data.p) }}
        </LabeledField>
      </div>

      <!-- Break -->

      <div class="span-2">
        <LabeledField label="Integral">
          {{ prettyQty(block.data.integral) }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">*</div>

      <div class="span-2">
        <QuantityField
          :model-value="block.data.kp"
          label="Kp"
          tag-class="darkish"
          readonly
        />
      </div>

      <div class="span-1 self-center text-center">/</div>

      <div class="span-2">
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
                to the target value but a small error remains,
                the integrator corrects it.
                The integrator action (I) will increase by (P)
                every period of duration Ti.
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
        />
      </div>

      <div class="span-1 self-center text-center">=</div>

      <div class="span-2">
        <InputField
          :model-value="block.data.i"
          :html="true"
          type="number"
          title="Manually set integral"
          label="I"
          message="
              <p>
                The integrator slowly builds up when the error is not zero.
                If you don't want to wait for that,
                you can manually set the integral part of the output here.
              </p>
              <p>
                It will continue to adjust automatically afterwards.
              </p>
              "
          borderless
          @update:model-value="(v) => patchBlock({ integralReset: v || 0.001 })"
        />
      </div>

      <!-- Break -->

      <div class="span-2">
        <LabeledField
          :tag-class="{ darkish: block.data.td.value === 0 }"
          label="Derivative"
        >
          {{ prettyQty(block.data.derivative) }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">*</div>

      <div class="span-2">
        <QuantityField
          :model-value="block.data.kp"
          label="Kp"
          tag-class="darkish"
          readonly
        />
      </div>

      <div class="span-1 self-center text-center">*</div>

      <div class="span-2">
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
        />
      </div>

      <div class="span-1 q-pt-sm self-center text-center">=</div>

      <div class="span-2 calc-line">
        <LabeledField label="D">
          {{ fixedNumber(block.data.d) }}
          <template #after>
            <sub class="self-end">+</sub>
          </template>
        </LabeledField>
      </div>

      <!-- Break -->

      <div
        v-if="boiling"
        class="calc-line"
        :style="grid({ start: 10, span: 2 })"
      >
        <LabeledField label="Boil mode">
          {{ fixedNumber(boilAdjustment) }}
          <template #after>
            <sub class="self-end">+</sub>
          </template>
        </LabeledField>
      </div>

      <!-- Break -->

      <div :style="grid({ start: 10, span: 2 })">
        <LabeledField label="Output">
          {{ fixedNumber(baseOutput + boilAdjustment) }}
        </LabeledField>
      </div>
    </div>

    <q-separator inset />

    <div class="widget-body row">
      <QuantityField
        v-model="boilMinOutputQty"
        title="Minimum output"
        label="Minimum output when boiling"
        class="col-grow"
      />
      <QuantityField
        v-model="boilPoint"
        title="Boil temperature"
        label="Boiling point"
        message="
              When the Setpoint setting is at or above this temperature,
              the <i>Minimum output when boiling</i> setting will apply.
            "
        :html="true"
        class="col-grow"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.grid-container
  display: grid
  grid-template-columns: repeat(11, 1fr)
  grid-row-gap: 10px

.span-1
  grid-column: span 1

.span-2
  grid-column: span 2
  padding-left: 5px
  padding-right: 5px

.calc-line
  border-bottom: 2px solid white
</style>
