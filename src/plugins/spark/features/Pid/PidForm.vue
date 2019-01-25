<script lang="ts">
import { Unit } from '@/helpers/units';
import { ActuatorAnalogLink, ProcessValueLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { PidBlock } from '@/plugins/spark/features/Pid/state';
import Component from 'vue-class-component';
import { filters } from './getters';

@Component
export default class PidForm extends BlockForm {
  defaultData() {
    return {
      inputId: new ProcessValueLink(null),
      outputId: new ActuatorAnalogLink(null),
      inputValue: new Unit(0, 'degC'),
      inputSetting: new Unit(0, 'degC'),
      outputValue: 0,
      outputSetting: 0,
      filter: 4,
      filterThreshold: new Unit(5, 'delta_degC'),
      enabled: false,
      active: true,
      kp: new Unit(20, '1/degC'),
      ti: new Unit(2, 'hour'),
      td: new Unit(0, 'second'),
      p: 0,
      i: 0,
      d: 0,
      error: new Unit(0, 'delta_degC'),
      integral: new Unit(0, 'delta_degC/second'),
      derivative: new Unit(0, 'delta_degC*second'),
    };
  }

  presets() {
    return [
      {
        label: 'Fridge compressor (cooling)',
        value: {
          filter: 4,
          filterThreshold: new Unit(5, 'delta_degC'),
          kp: new Unit(-10, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(5, 'min'),
        },
      },
      {
        label: 'Fridge heater',
        value: {
          filter: 4,
          filterThreshold: new Unit(5, 'delta_degC'),
          kp: new Unit(20, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(3, 'min'),
        },
      },
      {
        label: 'Kettle heating element',
        value: {
          filter: 2,
          filterThreshold: new Unit(2, 'delta_degC'),
          kp: new Unit(50, '1/degC'),
          ti: new Unit(10, 'min'),
          td: new Unit(0, 'min'),
        },
      },
      {
        label: 'HLT setpoint driver',
        value: {
          filter: 2,
          filterThreshold: new Unit(2, 'delta_degC'),
          kp: new Unit(1, '1/degC'),
          ti: new Unit(10, 'min'),
          td: new Unit(0, 'min'),
        },
      },
      {
        label: 'Glycol pump',
        value: {
          filter: 4,
          filterThreshold: new Unit(2, 'delta_degC'),
          kp: new Unit(-5, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(5, 'min'),
        },
      },
      {
        label: 'Heating pad',
        value: {
          filter: 4,
          filterThreshold: new Unit(2, 'delta_degC'),
          kp: new Unit(30, '1/degC'),
          ti: new Unit(2, 'hour'),
          td: new Unit(5, 'min'),
        },
      },
    ];
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
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>
    <q-collapsible group="modal" class="col-12" icon="help" label="About the PID Block">
      <div>
        <div class="q-subheading">What is a PID?</div>
        <p>
          A PID block can drive its output to regulate its input.
          The input is a process value, in most cases this will be a pair of a setpoint and sensor.
          The difference between the setpoint and the sensor is called the
          <i>error</i>.
        </p>
        <p>The output value is the sum of 3 parts derived from the error: proportional, integral and derivative.</p>
        <div class="q-subheading">Proportional</div>
        <p>
          The proportonial part is, as you'd expect, proportional to the error.
          This should be the main driver of the output value.
        </p>
        <div class="q-subheading">Integral</div>
        <p>
          Each second, the current value of the error is added to the integral.
          When the proportional part brings the input close to the target value but a small error remains,
          this small error will slowly build up in the integral.
          This increases the output until the error becomes zero.
          This is the purpose of the integral part of PID, to correct
          <i>steady state errors</i>.
        </p>
        <p>
          It will take Ti seconds for the integral part to become as large as the proportional part.
          If Ti is too small, the integral will do work that should be hanlded by the proportional part.
          Because the integral is slow to increase
          <i>and decrease</i>,
          a low Ti can cause too much actuator action after reaching the setpoint.
        </p>
        <p>Setting Ti to zero will disable the integrator.</p>
        <div class="q-subheading">Derivative</div>
        <p>
          Td can be seen as the duration of the overshoot that can be expected due to inertia in the system.
          The role of the derivative part is to prevent this overshoot.
          If the input is quickly approaching the target, the derivative can decrease the output for a slower approach.
        </p>
        <p>When there is no overshoot in the system, Td should be set to zero.</p>
        <div class="q-subheading">Filtering</div>
        <p>
          The error value is passed through a filter to remove noise, spikes and sudden jumps.
          <br>The amount of filtering can be configured.
          You should set the filter to the minimum duration of signal changes that you wish to let through unfiltered.
        </p>
        <p>
          The filter can detect steps in the input signal and temporarily respond faster.
          The threshold for steps that trigger this faster response can be configured too.
        </p>
      </div>
    </q-collapsible>
    <q-collapsible
      opened
      group="modal"
      class="col-12"
      icon="mdi-calculator-variant"
      label="Settings"
    >
      <div class="full-width bordered">
        <q-item>
          <q-item-main>
            This PID is currently
            <b v-if="block.data.enabled">enabled</b>
            <b v-if="!block.data.enabled">disabled</b>.
          </q-item-main>
          <q-item-side right>
            <q-btn
              v-if="block.data.enabled"
              label="Disable"
              color="negative"
              dense
              @click="() => { block.data.enabled = false; saveBlock(); }"
            />
            <q-btn
              v-if="!block.data.enabled"
              label="Enable"
              color="positive"
              dense
              @click="() => { block.data.enabled = true; saveBlock(); }"
            />
          </q-item-side>
        </q-item>
      </div>
      <div class="row">
        <q-list class="col-md-4 col-xs-12">
          <q-list-header>Input</q-list-header>
          <q-item>
            <q-item-side left class="label">Block</q-item-side>
            <q-item-main>
              <LinkPopupEdit
                :field="block.data.inputId"
                :service-id="block.serviceId"
                :change="callAndSaveBlock(v => block.data.inputId = v)"
                label="Input"
                display="span"
              >A PID block drives its output to regulate its input.
                <br>This input is a process value: something that has a target value and an actual value.
                <br>In most cases, this will be a sensor and setpoint pair.
              </LinkPopupEdit>
            </q-item-main>
          </q-item>
          <q-item>
            <q-item-side left class="label">Target value is</q-item-side>
            <q-item-main>
              <b>{{ block.data.inputSetting | unit }}</b>
            </q-item-main>
          </q-item>
          <q-item>
            <q-item-side left class="label">Current value is</q-item-side>
            <q-item-main>
              <b>{{ block.data.inputValue | unit }}</b>
            </q-item-main>
          </q-item>
        </q-list>
        <q-list class="col-md-4 col-xs-12">
          <q-list-header>Output</q-list-header>
          <q-item>
            <q-item-side left class="label">Block</q-item-side>
            <q-item-main>
              <LinkPopupEdit
                :field="block.data.outputId"
                :service-id="block.serviceId"
                :change="callAndSaveBlock(v => block.data.outputId = v)"
                label="Output"
                display="span"
              >The PID sets its output block to the result from the PID calculation.
                <br>The output block is an 'analog' actuator.
                <br>A digital actuator can be driven indirectly via a PWM actuator.
              </LinkPopupEdit>
            </q-item-main>
          </q-item>
          <q-item>
            <q-item-side left class="label">Target value is</q-item-side>
            <q-item-main>
              <b>{{ block.data.outputSetting | round }}</b>
            </q-item-main>
          </q-item>
          <q-item>
            <q-item-side left class="label">Current value is</q-item-side>
            <q-item-main>
              <b>{{ block.data.outputValue | round }}</b>
            </q-item-main>
          </q-item>
        </q-list>
        <q-list class="col-md-4 col-xs-12">
          <q-list-header>Filtering</q-list-header>
          <q-item>
            <q-item-side left class="label">Filter period</q-item-side>
            <q-item-main>
              <SelectPopupEdit
                :field="block.data.filter"
                :change="callAndSaveBlock(v => block.data.filter = v)"
                :options="filterOpts"
                label="Filter"
                display="span"
              />
            </q-item-main>
          </q-item>
          <q-item>
            <q-item-side left class="label">Fast step threshold</q-item-side>
            <q-item-main>
              <UnitPopupEdit
                :field="block.data.filterThreshold"
                :change="callAndSaveBlock(v => block.data.filterThreshold = v)"
                label="Filter threshold"
                display="span"
              />
            </q-item-main>
          </q-item>
        </q-list>
      </div>
      <div class="bordered calculation">
        <!-- state -->
        <q-field label="Filtered Error" orientation="vertical">{{ block.data.error | unit }}</q-field>
        <q-field label="Integral" orientation="vertical">{{ block.data.integral | unit }}</q-field>
        <q-field label="Derivative" orientation="vertical">{{ block.data.derivative | unit }}</q-field>
        <div/>
        <!-- operators -->
        <q-field label=" " orientation="vertical">*</q-field>
        <q-field label=" " orientation="vertical">*</q-field>
        <q-field label=" " orientation="vertical">*</q-field>
        <div/>
        <!-- Kp -->
        <q-field label="Kp" orientation="vertical">
          <UnitPopupEdit
            :field="block.data.kp"
            :change="callAndSaveBlock(v => block.data.kp = v)"
            label="Kp"
            display="span"
          />
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <span class="darkened">{{ block.data.kp | unit }}</span>
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <span class="darkened">{{ block.data.kp | unit }}</span>
        </q-field>
        <div/>
        <!-- operators -->
        <div/>
        <q-field label=" " orientation="vertical">/</q-field>
        <q-field label=" " orientation="vertical">*</q-field>
        <div/>
        <!-- settings -->
        <div/>
        <q-field label="Ti" orientation="vertical">
          <TimeUnitPopupEdit
            :field="block.data.ti"
            :change="callAndSaveBlock(v => block.data.ti = v)"
            label="Ti"
            display="span"
          />
        </q-field>
        <q-field label="Td" orientation="vertical">
          <TimeUnitPopupEdit
            :field="block.data.td"
            :change="callAndSaveBlock(v => block.data.td = v)"
            label="Td"
            display="span"
          />
        </q-field>
        <div/>
        <!-- equal signs -->
        <q-field label=" " orientation="vertical">=</q-field>
        <q-field label=" " orientation="vertical">=</q-field>
        <q-field label=" " orientation="vertical">=</q-field>
        <div/>
        <!-- result -->
        <q-field label="P" orientation="vertical">{{ block.data.p | round }}</q-field>
        <q-field label="I" orientation="vertical">{{ block.data.i | round }}</q-field>
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
        <q-field orientation="vertical">{{ block.data.p + block.data.i + block.data.d | round }}</q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../../css/app.styl';

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
