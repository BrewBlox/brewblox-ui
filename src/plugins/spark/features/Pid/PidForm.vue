<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import { PidBlock } from '@/plugins/spark/features/Pid/state';
import Component from 'vue-class-component';
import { filters, defaultData, presets } from './getters';

@Component
export default class PidForm extends BlockForm {
  defaultData() {
    return defaultData();
  }

  presets() {
    return presets();
  }

  get block() {
    return this.blockField as PidBlock;
  }

  get filterOpts() {
    return filters.map((filter, idx) => ({ label: filter, value: idx }));
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="mdi-calculator-variant" label="Settings">
        <BlockEnableToggle
          v-bind="$props"
          :text-enabled="`PID is enabled: output ${block.data.outputId} will be set to result of PID.`"
          :text-disabled="`PID is disabled: output ${block.data.outputId} will not be set.`"
          class="full-width bordered"
        />
        <q-separator dark inset/>

        <q-item dark>
          <q-item-section>Input Block</q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.inputId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.inputId = v)"
              label="Input"
              tag="span"
            >
              <p>A PID block drives its output to regulate its input.</p>
              <p>
                This input is a process value: something that has a target value and an actual value.
                In most cases, this will be a sensor and setpoint pair.
              </p>
              <p>The input target minus the input value is called the error</p>
            </LinkPopupEdit>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Target value is</q-item-section>
          <q-item-section class="text-bold">{{ block.data.inputSetting | unit }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Current value is</q-item-section>
          <q-item-section class="text-bold">{{ block.data.inputValue | unit }}</q-item-section>
        </q-item>
        <q-separator dark inset/>

        <q-item dark>
          <q-item-section>Output Block</q-item-section>
          <q-item-section>
            <LinkPopupEdit
              :field="block.data.outputId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.outputId = v)"
              label="Output"
              tag="span"
            >
              <p>The PID sets its output block to the result from the PID calculation.</p>
              <p>
                The output value is the sum of 3 parts derived from the input error:
                Proportional, Integral and Derivative.
              </p>
              <p>
                The output block is an 'analog' actuator.
                A digital actuator can be driven indirectly via a PWM actuator.
              </p>
            </LinkPopupEdit>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Target value is</q-item-section>
          <q-item-section class="text-bold">{{ block.data.outputSetting | round }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Current value is</q-item-section>
          <q-item-section class="text-bold">{{ block.data.outputValue | unit }}</q-item-section>
        </q-item>
        <q-separator dark inset/>

        <q-item dark>
          <q-item-section>Filter period</q-item-section>
          <q-item-section>
            <SelectPopupEdit
              :field="block.data.filter"
              :change="callAndSaveBlock(v => block.data.filter = v)"
              :options="filterOpts"
              label="Filter"
              tag="span"
            >
              <p>
                The input error is passed through a filter to remove noise, spikes and sudden jumps.
                This smooths the output of the PID.
              </p>
              <p>The filter should block changes lasting shorter than:</p>
            </SelectPopupEdit>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Fast step threshold</q-item-section>
          <q-item-section>
            <UnitPopupEdit
              :field="block.data.filterThreshold"
              :change="callAndSaveBlock(v => block.data.filterThreshold = v)"
              label="Filter threshold"
              tag="span"
            >
              <p>
                Filtering the input causes a delay in response, because it averages values.
                The filter can detect when a larger step occurs to which it should respond faster.
              </p>
              <p>If a step exceeds this threshold, respond faster:</p>
            </UnitPopupEdit>
          </q-item-section>
        </q-item>
        <q-separator dark inset/>

        <q-item dark>
          <q-item-section>
            <q-item-label caption class="text-no-wrap">Filtered error</q-item-label>
            {{ block.data.error | unit }}
          </q-item-section>
          <q-item-section class="text-center">*</q-item-section>
          <q-item-section>
            <q-item-label caption>Kp</q-item-label>
            <UnitPopupEdit
              :field="block.data.kp"
              :change="callAndSaveBlock(v => block.data.kp = v)"
              label="Proportional gain Kp"
              tag="span"
            >
              <p>
                Kp is the proportional gain, which is directly mutiplied by the filtered error.
                For each degree that the beer is too low, Kp is added to the output.
              </p>
              <p>Kp should be negative if the actuator brings down the input, like a cooler.</p>
            </UnitPopupEdit>
          </q-item-section>
          <q-item-section/>
          <q-item-section/>
          <q-item-section class="text-center">=</q-item-section>
          <q-item-section>
            <q-item-label caption>P</q-item-label>
            {{ block.data.p | round }}
          </q-item-section>
        </q-item>

        <q-item dark>
          <q-item-section>
            <q-item-label caption>Integral</q-item-label>
            {{ block.data.integral | unit }}
          </q-item-section>
          <q-item-section class="text-center">*</q-item-section>
          <q-item-section>
            <q-item-label caption>Kp</q-item-label>
            <div class="darkened">{{ block.data.kp | unit }}</div>
          </q-item-section>
          <q-item-section class="text-center">/</q-item-section>
          <q-item-section>
            <q-item-label caption>Ti</q-item-label>
            <TimeUnitPopupEdit
              :field="block.data.ti"
              :change="callAndSaveBlock(v => block.data.ti = v)"
              label="Integral time constant Ti"
              tag="span"
            >
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
            </TimeUnitPopupEdit>
          </q-item-section>
          <q-item-section class="text-center">=</q-item-section>
          <q-item-section>
            <q-item-label caption>I</q-item-label>
            {{ block.data.i | round }}
          </q-item-section>
        </q-item>

        <q-item dark>
          <q-item-section>
            <q-item-label caption>Derivative</q-item-label>
            {{ block.data.derivative | unit }}
          </q-item-section>
          <q-item-section class="text-center">*</q-item-section>
          <q-item-section>
            <q-item-label caption>Kp</q-item-label>
            <div class="darkened">{{ block.data.kp | unit }}</div>
          </q-item-section>
          <q-item-section class="text-center">*</q-item-section>
          <q-item-section>
            <q-item-label caption>Td</q-item-label>
            <TimeUnitPopupEdit
              :field="block.data.td"
              :change="callAndSaveBlock(v => block.data.td = v)"
              label="Derivative time constant Td"
              tag="span"
            >
              <p>
                When the error is decreasing fast, the derivative action (D) counteracts the proportional action (P).
                This slows down the approach to avoid overshoot.
              </p>
              <p>
                Td is the derivative time constant.
                It should be equal how long it takes for the process to stabilize after you turn off the actuator.
                When there is no overshoot in the system, Td should be set to zero.
              </p>
            </TimeUnitPopupEdit>
          </q-item-section>
          <q-item-section class="text-center">=</q-item-section>
          <q-item-section>
            <q-item-label caption>D</q-item-label>
            <div style="border-bottom: solid 2px white; min-width: 60px;">
              {{ block.data.d | round }}
              <span style="float: right;">
                <sub>+</sub>
              </span>
            </div>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section v-for="i in 6" :key="i"/>
          <q-item-section>{{ block.data.p + block.data.i + block.data.d | round }}</q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
