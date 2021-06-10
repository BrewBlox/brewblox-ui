<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { Block, PidBlock, Quantity, SetpointSensorPairBlock } from '@/plugins/spark/types';
import { isBlockDriven, prettyBlock } from '@/plugins/spark/utils';
import { createBlockDialog } from '@/utils/dialog';
import { fixedNumber, prettyQty } from '@/utils/formatting';
import { tempQty } from '@/utils/quantity';

interface GridOpts {
  start?: number;
  span?: number;
}

export default defineComponent({
  name: 'PidFull',
  setup() {
    const {
      sparkModule,
      serviceId,
      block,
      saveBlock,
    } = useBlockWidget.setup<PidBlock>();

    const inputBlock = computed<SetpointSensorPairBlock | null>(
      () => sparkModule.blockByLink(block.value.data.inputId),
    );

    const inputDriven = computed<boolean>(
      () => isBlockDriven(inputBlock.value),
    );

    const inputStoredSetting = computed<Quantity | null>({
      get: () => inputBlock.value?.data.storedSetting ?? null,
      set: q => {
        if (inputBlock.value && q) {
          inputBlock.value.data.storedSetting = q;
          sparkModule.saveBlock(inputBlock.value);
        }
      },
    });

    const outputBlock = computed<Block | null>(
      () => sparkModule.blockByLink(block.value.data.outputId),
    );

    const baseOutput = computed<number>(
      () => {
        const { p, i, d } = block.value.data;
        return p + i + d;
      },
    );

    const boiling = computed<boolean>(
      () => block.value.data.boilModeActive,
    );

    const boilAdjustment = computed<number>(
      () => boiling.value
        ? block.value.data.boilMinOutput - baseOutput.value
        : 0,
    );

    const waterBoilTemp = computed<Quantity>(
      () => tempQty(100),
    );

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
      saveBlock,
      inputBlock,
      inputDriven,
      inputStoredSetting,
      outputBlock,
      baseOutput,
      boiling,
      boilAdjustment,
      waterBoilTemp,
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
              <p>A PID block drives its output to regulate its input.</p>
              <p>
                This input is a process value: something that has a target value and an actual value.
                In most cases, this will be a sensor and setpoint pair.
              </p>
              <p>The input target minus the input value is called the error</p>
              "
        class="col-grow"
        @update:model-value="v => { block.data.inputId = v; saveBlock(); }"
      />
      <div class="col-grow">
        <QuantityField
          v-if="inputBlock !== null"
          v-model="inputStoredSetting"
          :readonly="inputDriven"
          :class="[{darkened: !inputBlock.data.settingEnabled}, 'col']"
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
              <p>The PID sets its output block to the result from the PID calculation.</p>
              <p>
                The output value is the sum of 3 parts derived from the input error:
                Proportional, Integral and Derivative.
              </p>
              <p>
                The output block is an 'analog' actuator.
                A digital actuator can be driven indirectly via a PWM actuator.
              </p>
              "
        class="col-grow"
        @update:model-value="v => { block.data.outputId = v; saveBlock(); }"
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

      <div class="span-1 self-center text-center">
        *
      </div>

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
          @update:model-value="v => { block.data.kp = v; saveBlock(); }"
        />
      </div>

      <div :style="grid({start: 9})" class="self-center text-center">
        =
      </div>

      <div class="span-2">
        <LabeledField label="P">
          {{ fixedNumber(block.data.p ) }}
        </LabeledField>
      </div>

      <!-- Break -->

      <div class="span-2">
        <LabeledField label="Integral">
          {{ prettyQty(block.data.integral) }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <QuantityField :model-value="block.data.kp" label="Kp" tag-class="darkish" readonly />
      </div>

      <div class="span-1 self-center text-center">
        /
      </div>

      <div class="span-2">
        <DurationField
          :model-value="block.data.ti"
          :rules="[
            v => v >= 0 || 'Value must be positive',
            v => v < (2**16*1000) || 'Value is too large to be stored in firmware',
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
                When the proportional action (P) brings the input close to the target value but a small error remains,
                the integrator corrects it.
                The integrator action (I) will increase by (P) every period of duration Ti.
              </p>
              <p>
                The integrator should be slow enough to give the process time to respond to proportional action (P).
                Overshoot due to too much integrator action is usually a sign of Kp being too low.
              </p>
              <p>Setting Ti to zero will disable the integrator.</p>
              "
          borderless
          @update:model-value="v => { block.data.ti = v; saveBlock(); }"
        />
      </div>

      <div class="span-1 self-center text-center">
        =
      </div>

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
                If you don't want to wait for that, you can manually set the integral part of the output here.
              </p>
              <p>
                It will continue to adjust automatically afterwards.
              </p>
              "
          borderless
          @update:model-value="v => { block.data.integralReset = v || 0.001; saveBlock(); }"
        />
      </div>

      <!-- Break -->

      <div class="span-2">
        <LabeledField :tag-class="{darkish: block.data.td.value === 0}" label="Derivative">
          {{ prettyQty(block.data.derivative) }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <QuantityField :model-value="block.data.kp" label="Kp" tag-class="darkish" readonly />
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <DurationField
          :model-value="block.data.td"
          :rules="[
            v => v >= 0 || 'Value must be positive',
            v => v < (2**16*1000) || 'Value is too large to be stored in firmware',
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
              It should be equal to how long it takes for the process to stabilize after you turn off the actuator.
              </p>
              <p>
              When there is no overshoot in the system, Td should be set to zero.
              </p>
              "
          borderless
          @update:model-value="v => { block.data.td = v; saveBlock(); }"
        />
      </div>

      <div class="span-1 q-pt-sm self-center text-center">
        =
      </div>

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
        :style="grid({start: 10, span: 2})"
      >
        <LabeledField label="Boil mode">
          {{ fixedNumber(boilAdjustment) }}
          <template #after>
            <sub class="self-end">+</sub>
          </template>
        </LabeledField>
      </div>

      <!-- Break -->

      <div :style="grid({start: 10, span: 2})">
        <LabeledField label="Output">
          {{ fixedNumber(baseOutput + boilAdjustment) }}
        </LabeledField>
      </div>
    </div>

    <q-separator inset />

    <div class="widget-body row">
      <SliderField
        :model-value="block.data.boilMinOutput"
        :decimals="0"
        :quick-actions="[
          { label: '0%', value: 0 },
          { label: '50%', value: 50 },
          { label: '100%', value: 100 },
        ]"
        title="Minimum output"
        label="Minimum output when boiling"
        suffix="%"
        class="col-grow"
        @update:model-value="v => { block.data.boilMinOutput = v; saveBlock(); }"
      />
      <QuantityField
        :model-value="block.data.boilPointAdjust"
        title="Boil point adjustment"
        label="Boil temperature setting"
        class="col-grow"
        @update:model-value="v => { block.data.boilPointAdjust = v; saveBlock(); }"
      >
        <template #value>
          <span class="darkish">{{ fixedNumber(waterBoilTemp.value, 0) }}</span> +
          <b>{{ fixedNumber(block.data.boilPointAdjust.value) }}</b>
        </template>
      </QuantityField>
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
