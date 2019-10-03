<script lang="ts">
import { Component } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import { Unit } from '@/helpers/units';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { PidBlock } from '@/plugins/spark/features/Pid/types';
import { sparkStore } from '@/plugins/spark/store';

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

  get boilAdjustment(): number {
    return this.block.data.boilModeActive
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
}
</script>

<template>
  <q-card dark v-bind="$attrs">
    <slot name="toolbar" />

    <q-card-section>
      <BlockEnableToggle
        :crud="crud"
        :text-enabled="`PID is enabled: output ${block.data.outputId} will be set to output of PID.`"
        :text-disabled="`PID is disabled: output ${block.data.outputId} will not be set.`"
        class="full-width bordered"
      />
      <q-separator dark inset />

      <!-- Input row -->
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Input Block
          </q-item-label>
          <LinkField
            :value="block.data.inputId"
            :service-id="serviceId"
            title="Input"
            tag="div"
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
          <q-item-label caption>
            Target value is
          </q-item-label>
          <q-item-section class="text-bold">
            {{ block.data.inputSetting | unit }}
          </q-item-section>
        </q-item-section>

        <q-item-section>
          <q-item-label caption>
            Current value is
          </q-item-label>
          <div class="text-bold">
            {{ block.data.inputValue | unit }}
          </div>
        </q-item-section>

        <q-item-section class="col-1">
          <q-btn v-if="hasInputBlock" flat icon="mdi-pencil" @click="showInput">
            <q-tooltip>Edit {{ inputId }}</q-tooltip>
          </q-btn>
          <q-btn v-else disable flat icon="mdi-pencil-off" />
        </q-item-section>
      </q-item>
      <q-separator dark inset />

      <!-- Output row -->
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Output Block
          </q-item-label>
          <LinkField
            :value="block.data.outputId"
            :service-id="serviceId"
            title="Output"
            tag="div"
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
          <q-item-label caption>
            Target value is
          </q-item-label>
          <div class="text-bold">
            {{ block.data.outputSetting | round }}
          </div>
        </q-item-section>

        <q-item-section>
          <q-item-label caption>
            Achieved value is
          </q-item-label>
          <div class="text-bold">
            {{ block.data.outputValue | round }}
          </div>
        </q-item-section>

        <q-item-section class="col-1">
          <q-btn v-if="hasOutputBlock" flat icon="mdi-pencil" @click="showOutput">
            <q-tooltip>Edit {{ outputId }}</q-tooltip>
          </q-btn>
          <q-btn v-else disable flat icon="mdi-pencil-off" />
        </q-item-section>
      </q-item>
      <q-separator dark inset />

      <!-- Boil mode settings -->
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Boil temperature
          </q-item-label>
          <span>
            {{ waterBoilTemp.value | round(0) }} + <UnitField
              :value="block.data.boilPointAdjust"
              title="Boil point adjustment"
              label="Adjustment"
              @input="v => { block.data.boilPointAdjust = v; saveBlock(); }"
            />
          </span>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Minimum output when boiling
          </q-item-label>
          <SliderField
            :value="block.data.boilMinOutput"
            title="Minimum output"
            @input="v => { block.data.boilMinOutput = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section />
        <q-item-section class="col-1" />
      </q-item>
      <q-separator dark inset />

      <!-- Calculations -->
      <q-item dark>
        <q-item-section>
          <q-item-label caption class="text-no-wrap">
            Error
          </q-item-label>
          {{ block.data.error | unit }}
        </q-item-section>
        <q-item-section class="text-center">
          *
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Kp
          </q-item-label>
          <UnitField
            :value="block.data.kp"
            title="Proportional gain Kp"
            label="Proportional gain"
            message-html="
              <p>
                Kp is the proportional gain, which is directly mutiplied by the filtered error.
                The output of the PID is Kp * input error.
                Set it to what you think the output should be for a 1 degree error.
              </p>
              <p>Kp should be negative if the actuator brings down the input, like a cooler.</p>
              "
            @input="v => { block.data.kp = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section />
        <q-item-section />
        <q-item-section class="text-center">
          =
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            P
          </q-item-label>
          {{ block.data.p | round }}
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Integral
          </q-item-label>
          {{ block.data.integral | unit }}
        </q-item-section>
        <q-item-section class="text-center">
          *
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Kp
          </q-item-label>
          <div class="darkened">
            {{ block.data.kp | unit }}
          </div>
        </q-item-section>
        <q-item-section class="text-center">
          /
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Ti
          </q-item-label>
          <TimeUnitField
            :value="block.data.ti"
            title="Integral time constant Ti"
            label="Integral time constant"
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
            @input="v => { block.data.ti = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section class="text-center">
          =
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            I
          </q-item-label>
          <InputField
            :value="block.data.i"
            type="number"
            title="Manually set integral"
            message-html="
              <p>
                The integrator slowly builds up when the error is not zero.
                If you don't want to wait for that, you can manually set the integral part of the output here.
              </p>
              <p>
                It will continue to adjust automatically afterwards.
              </p>
              "
            @input="v => { block.data.integralReset = v || 0.001; saveBlock(); }"
          />
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Derivative
          </q-item-label>
          <span :class="{darkened: block.data.td.val === 0}">{{ block.data.derivative | unit }}</span>
        </q-item-section>
        <q-item-section class="text-center">
          *
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Kp
          </q-item-label>
          <div class="darkened">
            {{ block.data.kp | unit }}
          </div>
        </q-item-section>
        <q-item-section class="text-center">
          *
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Td
          </q-item-label>
          <TimeUnitField
            :value="block.data.td"
            title="Derivative time constant Td"
            label="Derivative time constant"
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
            @input="v => { block.data.td = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section class="text-center">
          =
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            D
          </q-item-label>
          <div style="border-bottom: solid 2px white; min-width: 60px;">
            {{ block.data.d | round }}
            <!-- {{ boilAdjustment | round }} -->
            <span style="float: right;">
              <sub>+</sub>
            </span>
          </div>
        </q-item-section>
      </q-item>

      <q-item v-if="block.data.boilModeActive" dark>
        <q-item-section v-for="i in 6" :key="'boil'+i" />
        <q-item-section>
          <q-item-label caption>
            Boil mode
          </q-item-label>
          <div style="border-bottom: solid 2px white; min-width: 60px;">
            {{ boilAdjustment | round }}
            <span style="float: right;">
              <sub>+</sub>
            </span>
          </div>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section v-for="i in 6" :key="`output-${i}`" />
        <q-item-section>
          <q-item-label caption>
            Output
          </q-item-label>
          {{ baseOutput + boilAdjustment | round }}
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
