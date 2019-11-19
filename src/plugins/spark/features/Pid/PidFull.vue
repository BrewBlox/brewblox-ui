<script lang="ts">
import { Component } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import { Unit } from '@/helpers/units';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { PidBlock } from '@/plugins/spark/features/Pid/types';
import { sparkStore } from '@/plugins/spark/store';

interface GridOpts {
  start?: number;
  span?: number;
}

@Component
export default class PidFull extends BlockCrudComponent {
  readonly block!: PidBlock;

  get inputId(): string | null {
    return this.block.data.inputId.id;
  }

  get outputId(): string | null {
    return this.block.data.outputId.id;
  }

  get hasInputBlock(): boolean {
    return !!this.inputId
      && sparkStore
        .blockIds(this.serviceId)
        .includes(this.inputId);
  }

  get hasOutputBlock(): boolean {
    return !!this.outputId
      && sparkStore
        .blockIds(this.serviceId)
        .includes(this.outputId);
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

  get waterBoilTemp(): Unit {
    return this.block.data.boilPointAdjust.unit === 'delta_degF'
      ? new Unit(212, 'degF')
      : new Unit(100, 'degC');
  }

  showInput(): void {
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.inputId));
  }

  showOutput(): void {
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.outputId));
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
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`PID is enabled: output ${block.data.outputId} will be set to output of PID.`"
        :text-disabled="`PID is disabled: output ${block.data.outputId} will not be set.`"
        class="full-width bordered"
      />
      <q-separator inset />

      <!-- Input row -->
      <q-item class="items-start">
        <q-item-section>
          <BlockField
            :value="block.data.inputId"
            :service-id="serviceId"
            title="Input"
            label="Input Block"
            no-show
            message-html="
              <p>A PID block drives its output to regulate its input.</p>
              <p>
                This input is a process value: something that has a target value and an actual value.
                In most cases, this will be a sensor and setpoint pair.
              </p>
              <p>The input target minus the input value is called the error</p>
              "
            @input="v => { block.data.inputId = v; saveBlock(); }"
          />
        </q-item-section>

        <q-item-section>
          <UnitField :value="block.data.inputSetting" label="Target value is" tag="b" readonly />
        </q-item-section>

        <q-item-section>
          <UnitField :value="block.data.inputValue" label="Current value is" tag="b" readonly />
        </q-item-section>

        <q-item-section class="col-1 self-center">
          <q-btn v-if="hasInputBlock" flat icon="mdi-pencil" @click="showInput">
            <q-tooltip>Edit {{ inputId }}</q-tooltip>
          </q-btn>
          <q-btn v-else disable flat icon="mdi-pencil-off" />
        </q-item-section>
      </q-item>
      <q-separator inset />

      <!-- Output row -->
      <q-item class="items-start">
        <q-item-section>
          <BlockField
            :value="block.data.outputId"
            :service-id="serviceId"
            title="Output"
            label="Output Block"
            no-show
            message-html="
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
            @input="v => { block.data.outputId = v; saveBlock(); }"
          />
        </q-item-section>

        <q-item-section>
          <ValueField :value="block.data.outputSetting" number label="Target value is" tag="b" />
        </q-item-section>

        <q-item-section>
          <ValueField :value="block.data.outputValue" number label="Achieved value is" tag="b" />
        </q-item-section>

        <q-item-section class="col-1 self-center">
          <q-btn v-if="hasOutputBlock" flat icon="mdi-pencil" @click="showOutput">
            <q-tooltip>Edit {{ outputId }}</q-tooltip>
          </q-btn>
          <q-btn v-else disable flat icon="mdi-pencil-off" />
        </q-item-section>
      </q-item>
      <q-separator inset />

      <!-- Boil mode settings -->
      <q-item>
        <q-item-section>
          <UnitField
            :value="block.data.boilPointAdjust"
            title="Boil point adjustment"
            label="Boil temperature"
            tag="span"
            @input="v => { block.data.boilPointAdjust = v; saveBlock(); }"
          >
            <template #value>
              <span class="darkish">{{ waterBoilTemp.value | round(0) }}</span> +
              <b>{{ block.data.boilPointAdjust.value | round }}</b>
            </template>
          </UnitField>
        </q-item-section>
        <q-item-section>
          <SliderField
            :value="block.data.boilMinOutput"
            title="Minimum output"
            label="Minimum output when boiling"
            @input="v => { block.data.boilMinOutput = v; saveBlock(); }"
          />
        </q-item-section>
        <!-- <q-item-section /> -->
        <!-- <q-item-section class="col-1" /> -->
      </q-item>
      <q-separator inset />


      <div class="grid-container q-mx-md q-mt-md q-item--dark">
        <div class="span-2">
          <ValueField label="Error">
            {{ block.data.error | unit }}
          </ValueField>
        </div>

        <div class="span-1 self-center">
          *
        </div>

        <div class="span-2">
          <UnitField
            :value="block.data.kp"
            title="Proportional gain Kp"
            label="Kp"
            message-html="
              <p>
                Kp is the proportional gain, which is directly mutiplied by the filtered error.
                The output of the PID is Kp * input error.
                Set it to what you think the output should be for a 1 degree error.
              </p>
              <p>Kp should be negative if the actuator brings down the input, like a cooler.</p>
              "
            borderless
            class="dashed-input"
            @input="v => { block.data.kp = v; saveBlock(); }"
          />
        </div>

        <div :style="grid({start: 9})" class="self-center">
          =
        </div>

        <div class="span-2">
          <ValueField label="P">
            {{ block.data.p | round }}
          </ValueField>
        </div>

        <!-- Break -->

        <div class="span-2">
          <ValueField label="Integral">
            {{ block.data.integral | unit }}
          </ValueField>
        </div>

        <div class="span-1 self-center">
          *
        </div>

        <div class="span-2">
          <ValueField label="Kp" tag-class="darkish">
            {{ block.data.kp | unit }}
          </ValueField>
        </div>

        <div class="span-1 self-center">
          /
        </div>

        <div class="span-2">
          <TimeUnitField
            :value="block.data.ti"
            title="Integral time constant Ti"
            label="Ti"
            message-html="
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
            class="dashed-input"
            @input="v => { block.data.ti = v; saveBlock(); }"
          />
        </div>

        <div class="span-1 self-center">
          =
        </div>

        <div class="span-2">
          <InputField
            :value="block.data.i"
            type="number"
            title="Manually set integral"
            label="I"
            message-html="
              <p>
                The integrator slowly builds up when the error is not zero.
                If you don't want to wait for that, you can manually set the integral part of the output here.
              </p>
              <p>
                It will continue to adjust automatically afterwards.
              </p>
              "
            borderless
            class="dashed-input"
            @input="v => { block.data.integralReset = v || 0.001; saveBlock(); }"
          />
        </div>

        <!-- Break -->

        <div class="span-2">
          <ValueField :tag-class="{darkish: block.data.td.val === 0}" label="Derivative">
            {{ block.data.derivative | unit }}
          </ValueField>
        </div>

        <div class="span-1 self-center">
          *
        </div>

        <div class="span-2">
          <ValueField label="Kp" tag-class="darkish">
            {{ block.data.kp | unit }}
          </ValueField>
        </div>

        <div class="span-1 self-center">
          *
        </div>

        <div class="span-2">
          <TimeUnitField
            :value="block.data.td"
            title="Derivative time constant Td"
            label="Td"
            message-html="
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
            class="dashed-input"
            @input="v => { block.data.td = v; saveBlock(); }"
          />
        </div>

        <div class="span-1 q-pt-sm">
          =
        </div>

        <div class="span-2 calc-line">
          <ValueField label="D">
            {{ block.data.d | round }}
            <template #after>
              <sub>+</sub>
            </template>
          </ValueField>
        </div>

        <!-- Break -->

        <div
          v-if="boiling"
          class="calc-line"
          :style="grid({start: 10, span: 2})"
        >
          <ValueField label="Boil mode">
            {{ boilAdjustment | round }}
            <template #after>
              <sub>+</sub>
            </template>
          </ValueField>
        </div>

        <!-- Break -->

        <div :style="grid({start: 10, span: 2})">
          <ValueField label="Output">
            {{ baseOutput + boilAdjustment | round }}
          </ValueField>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(11, auto);
  grid-row-gap: 10px;
}

.span-1 {
  grid-column: span 1;
}

.span-2 {
  grid-column: span 2;
}

.calc-line {
  border-bottom: 2px solid white;
}

.dashed-input {
  border-bottom: 1px dashed grey;
}
</style>
