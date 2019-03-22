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
  <div class="widget-modal column">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block" />
    <q-expansion-item class="text-h6"
      opened
      group="modal"
      
      icon="mdi-calculator-variant"
      label="Settings"
    >
      <BlockEnableToggle
        v-bind="$props"
        :block="block"
        :text-enabled="`PID is enabled: output ${block.data.outputId} will be set to result of PID.`"
        :text-disabled="`PID is disabled: output ${block.data.outputId} will not be set.`"
        class="full-width bordered"
      />
      <div class="row">
        <q-list class="col-md-4 col-xs-12">
          <q-item-label class="justify-center">
Input
            <q-item-label header>
              <q-item dark>
                <q-item-side left class="label">
Block
</q-item-side>
                <q-item-main>
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
                </q-item-main>
              </q-item>
              <q-item dark>
                <q-item-side left class="label">
Target value is
</q-item-side>
                <q-item-main>
                  <b>{{ block.data.inputSetting | unit }}</b>
                </q-item-main>
              </q-item>
              <q-item dark>
                <q-item-side left class="label">
Current value is
</q-item-side>
                <q-item-main>
                  <b>{{ block.data.inputValue | unit }}</b>
                </q-item-main>
              </q-item>
            </q-item-label>
          </q-item-label>
        </q-list>
        <q-list class="col-md-4 col-xs-12">
          <q-item-label class="justify-center">
Output
            <q-item-label header>
              <q-item dark>
                <q-item-side left class="label">
Block
</q-item-side>
                <q-item-main>
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
                </q-item-main>
              </q-item>
              <q-item dark>
                <q-item-side left class="label">
Target value is
</q-item-side>
                <q-item-main>
                  <b>{{ block.data.outputSetting | round }}</b>
                </q-item-main>
              </q-item>
              <q-item dark>
                <q-item-side left class="label">
Current value is
</q-item-side>
                <q-item-main>
                  <b>{{ block.data.outputValue | round }}</b>
                </q-item-main>
              </q-item>
            </q-item-label>
          </q-item-label>
        </q-list>
        <q-list class="col-md-4 col-xs-12">
          <q-item-label class="justify-center">
Filtering
            <q-item-label header>
              <q-item dark>
                <q-item-side left class="label">
Filter period
</q-item-side>
                <q-item-main>
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
                </q-item-main>
              </q-item>
              <q-item dark>
                <q-item-side left class="label">
Fast step threshold
</q-item-side>
                <q-item-main>
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
                </q-item-main>
              </q-item>
            </q-item-label>
          </q-item-label>
        </q-list>
      </div>
      <div class="bordered calculation">
        <!-- state -->
        <q-field label="Filtered error" orientation="vertical">
{{ block.data.error | unit }}
</q-field>
        <q-field label="Integral" orientation="vertical">
{{ block.data.integral | unit }}
</q-field>
        <q-field label="Derivative" orientation="vertical">
{{ block.data.derivative | unit }}
</q-field>
        <div />
        <!-- operators -->
        <q-field label=" " orientation="vertical">
*
</q-field>
        <q-field label=" " orientation="vertical">
*
</q-field>
        <q-field label=" " orientation="vertical">
*
</q-field>
        <div />
        <!-- Kp -->
        <q-field label="Kp" orientation="vertical">
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
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <span class="darkened">{{ block.data.kp | unit }}</span>
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <span class="darkened">{{ block.data.kp | unit }}</span>
        </q-field>
        <div />
        <!-- operators -->
        <div />
        <q-field label=" " orientation="vertical">
/
</q-field>
        <q-field label=" " orientation="vertical">
*
</q-field>
        <div />
        <!-- settings -->
        <div />
        <q-field label="Ti" orientation="vertical">
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
        </q-field>
        <q-field label="Td" orientation="vertical">
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
        </q-field>
        <div />
        <!-- equal signs -->
        <q-field label=" " orientation="vertical">
=
</q-field>
        <q-field label=" " orientation="vertical">
=
</q-field>
        <q-field label=" " orientation="vertical">
=
</q-field>
        <div />
        <!-- result -->
        <q-field label="P" orientation="vertical">
{{ block.data.p | round }}
</q-field>
        <q-field label="I" orientation="vertical">
{{ block.data.i | round }}
</q-field>
        <q-field
          label="D"
          orientation="vertical"
          style="border-bottom: solid 2px white; min-width: 60px;"
        >
          {{ block.data.d | round }}
          <span style="float: right;">
            <sub>+</sub>
          </span>
        </q-field>
        <q-field orientation="vertical">
{{ block.data.p + block.data.i + block.data.d | round }}
</q-field>
      </div>
    </q-expansion-item>

    <q-expansion-item class="text-h6" group="modal" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()" />
    </q-expansion-item>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../../styles/quasar.styl';

.q-subheading {
  color: $tertiary;
  display: block;
  clear: both;
}

.calculation {
  display: grid;
  align-content: center;
  justify-content: center;
  grid-auto-flow: column;
  grid-template-rows: auto auto auto auto;
  grid-template-columns: auto auto auto auto auto auto;
  grid-gap: 15px;
  padding: 10px;
}

.bordered {
  border: 1px solid $item-separator-color;
  border-collapse: collapse;
}

.calculation /deep/ .q-field-content {
  padding-top: 6px;
}

.input-output .q-item {
  width: 100%;
}
</style>
