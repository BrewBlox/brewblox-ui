<script lang="ts">
import { Component } from 'vue-property-decorator';

import { bloxQty } from '@/helpers/bloxfield';
import { createBlockDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { serviceTemp } from '@/plugins/spark/helpers';
import { Block, PidBlock, Quantity, SetpointSensorPairBlock } from '@/plugins/spark/types';

interface GridOpts {
  start?: number;
  span?: number;
}

@Component
export default class PidFull
  extends BlockCrudComponent<PidBlock> {

  get inputBlock(): SetpointSensorPairBlock | null {
    return this.sparkModule.blockById(this.block.data.inputId.id);
  }

  get inputDriven(): boolean {
    return this.inputBlock !== null
      && this.sparkModule.drivenChains
        .some((chain: string[]) => chain[0] === this.inputBlock!.id);
  }

  get outputBlock(): Block | null {
    return this.sparkModule.blockById(this.block.data.outputId.id);
  }

  get baseOutput(): number {
    return this.block.data.p + this.block.data.i + this.block.data.d;
  }

  get boiling(): boolean {
    return this.block.data.boilModeActive;
  }

  get boilAdjustment(): number {
    return this.boiling
      ? this.block.data.boilMinOutput - this.baseOutput
      : 0;
  }

  get waterBoilTemp(): Quantity {
    return bloxQty(100, 'degC')
      .to(serviceTemp(this.serviceId));
  }

  showInput(): void {
    createBlockDialog(this.inputBlock);
  }

  showOutput(): void {
    createBlockDialog(this.outputBlock);
  }

  grid(opts: GridOpts): Mapped<string> {
    return {
      gridColumnStart: `${opts.start || 'auto'}`,
      gridColumnEnd: `span ${opts.span || 1}`,
    };
  }
}
</script>

<template>
  <div class="widget-lg">
    <slot name="warnings">
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`PID is enabled: output ${block.data.outputId} will be set to output of PID.`"
        :text-disabled="`PID is disabled: output ${block.data.outputId} will not be set.`"
        class="col"
      />
    </slot>

    <div class="widget-body row">
      <!-- Input row -->
      <LinkField
        :value="block.data.inputId"
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
        @input="v => { block.data.inputId = v; saveBlock(); }"
      />
      <div class="col-grow">
        <QuantityField
          v-if="!!inputBlock"
          :value="inputBlock.data.storedSetting"
          :readonly="inputDriven"
          :class="[{darkened: !inputBlock.data.settingEnabled}, 'col']"
          label="Setting"
          tag="b"
          @input="v => { inputBlock.data.storedSetting = v; saveStoreBlock(inputBlock); }"
        />
        <QuantityField
          v-else
          :value="block.data.inputSetting"
          label="Setting"
          tag="b"
          readonly
        />
      </div>
      <QuantityField
        :value="block.data.inputValue"
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
        <q-tooltip>Edit {{ inputBlock | link }}</q-tooltip>
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
        :value="block.data.outputId"
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
        @input="v => { block.data.outputId = v; saveBlock(); }"
      />
      <LabeledField
        :value="block.data.outputSetting"
        number
        label="Target value"
        tag="b"
        class="col-grow"
      />
      <LabeledField
        :value="block.data.outputValue"
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
        <q-tooltip>Edit {{ outputBlock | link }}</q-tooltip>
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
          {{ block.data.error | quantity }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <QuantityField
          :value="block.data.kp"
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
          @input="v => { block.data.kp = v; saveBlock(); }"
        />
      </div>

      <div :style="grid({start: 9})" class="self-center text-center">
        =
      </div>

      <div class="span-2">
        <LabeledField label="P">
          {{ block.data.p | round }}
        </LabeledField>
      </div>

      <!-- Break -->

      <div class="span-2">
        <LabeledField label="Integral">
          {{ block.data.integral | quantity }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <QuantityField :value="block.data.kp" label="Kp" tag-class="darkish" readonly />
      </div>

      <div class="span-1 self-center text-center">
        /
      </div>

      <div class="span-2">
        <DurationField
          :value="block.data.ti"
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
          @input="v => { block.data.ti = v; saveBlock(); }"
        />
      </div>

      <div class="span-1 self-center text-center">
        =
      </div>

      <div class="span-2">
        <InputField
          :value="block.data.i"
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
          @input="v => { block.data.integralReset = v || 0.001; saveBlock(); }"
        />
      </div>

      <!-- Break -->

      <div class="span-2">
        <LabeledField :tag-class="{darkish: block.data.td.value === 0}" label="Derivative">
          {{ block.data.derivative | quantity }}
        </LabeledField>
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <QuantityField :value="block.data.kp" label="Kp" tag-class="darkish" readonly />
      </div>

      <div class="span-1 self-center text-center">
        *
      </div>

      <div class="span-2">
        <DurationField
          :value="block.data.td"
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
          @input="v => { block.data.td = v; saveBlock(); }"
        />
      </div>

      <div class="span-1 q-pt-sm self-center text-center">
        =
      </div>

      <div class="span-2 calc-line">
        <LabeledField label="D">
          {{ block.data.d | round }}
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
          {{ boilAdjustment | round }}
          <template #after>
            <sub class="self-end">+</sub>
          </template>
        </LabeledField>
      </div>

      <!-- Break -->

      <div :style="grid({start: 10, span: 2})">
        <LabeledField label="Output">
          {{ baseOutput + boilAdjustment | round }}
        </LabeledField>
      </div>
    </div>

    <q-separator inset />

    <div class="widget-body row">
      <SliderField
        :value="block.data.boilMinOutput"
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
        @input="v => { block.data.boilMinOutput = v; saveBlock(); }"
      />
      <QuantityField
        :value="block.data.boilPointAdjust"
        title="Boil point adjustment"
        label="Boil temperature setting"
        class="col-grow"
        @input="v => { block.data.boilPointAdjust = v; saveBlock(); }"
      >
        <template #value>
          <span class="darkish">{{ waterBoilTemp.value | round(0) }}</span> +
          <b>{{ block.data.boilPointAdjust.value | round }}</b>
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
