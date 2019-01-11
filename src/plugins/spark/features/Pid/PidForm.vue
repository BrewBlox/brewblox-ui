<script lang="ts">
import { Unit } from '@/helpers/units';
import { ActuatorAnalogLink, ProcessValueLink } from '@/helpers/units/KnownLinks';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { PidBlock } from '@/plugins/spark/features/Pid/state';
import Component from 'vue-class-component';
import { filters } from './getters';

@Component
export default class PidForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          inputId: new ProcessValueLink(null),
          outputId: new ActuatorAnalogLink(null),
          inputValue: new Unit(0, 'degC'),
          inputSetting: new Unit(0, 'degC'),
          outputValue: 0,
          outputSetting: 0,
          filter: 0,
          filterThreshold: new Unit(0, 'delta_degC'),
          enabled: false,
          active: true,
          kp: new Unit(0, '1/degC'),
          ti: new Unit(0, 'second'),
          td: new Unit(0, 'second'),
          p: 0,
          i: 0,
          d: 0,
          error: new Unit(0, 'delta_degC'),
          integral: new Unit(0, 'delta_degC/second'),
          derivative: new Unit(0, 'delta_degC*second'),
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
    <q-toolbar v-if="$props.buttons" color="primary" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
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
    <q-collapsible group="modal" class="col-12" icon="help" label="PID Calculation">
      <div class="calculation">
        <!-- state -->
        <q-field label="Filtered Error" orientation="vertical">
          <big>{{ block.data.error | unit }}</big>
        </q-field>
        <q-field label="Integral" orientation="vertical">
          <big>{{ block.data.integral | unit }}</big>
        </q-field>
        <q-field label="Derivative" orientation="vertical">
          <big>{{ block.data.derivative | unit }}</big>
        </q-field>
        <div/>
        <!-- operators -->
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <div/>
        <!-- Kp -->
        <q-field label="Kp" orientation="vertical">
          <UnitPopupEdit
            :field="block.data.kp"
            :change="callAndSaveBlock(v => block.data.kp = v)"
            label="Kp"
          />
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <big class="darkened">{{ block.data.kp | unit }}</big>
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <big class="darkened">{{ block.data.kp | unit }}</big>
        </q-field>
        <div/>
        <!-- operators -->
        <div/>
        <q-field label=" " orientation="vertical">
          <big>/</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <div/>
        <!-- settings -->
        <div/>
        <q-field label="Ti" orientation="vertical">
          <TimeUnitPopupEdit
            :field="block.data.ti"
            :change="callAndSaveBlock(v => block.data.ti = v)"
            label="Ti"
          />
        </q-field>
        <q-field label="Td" orientation="vertical">
          <TimeUnitPopupEdit
            :field="block.data.td"
            :change="callAndSaveBlock(v => block.data.td = v)"
            label="Td"
          />
        </q-field>
        <div/>
        <!-- equal signs -->
        <q-field label=" " orientation="vertical">
          <big>=</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>=</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>=</big>
        </q-field>
        <div/>
        <!-- result -->
        <q-field label="P" orientation="vertical">
          <big>{{ block.data.p | round }}</big>
        </q-field>
        <q-field label="I" orientation="vertical">
          <big>{{ block.data.i | round }}</big>
        </q-field>
        <q-field
          label="D"
          orientation="vertical"
          style="border-bottom: solid 2px white; min-width: 60px;"
        >
          <big>{{ block.data.d | round }}</big>
          <big style="float: right;">
            <sub>+</sub>
          </big>
        </q-field>
        <div>
          <big>{{ block.data.p + block.data.i + block.data.d | round }}</big>
        </div>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="help" label="Input and output">
      <div class="input-output">
        <q-field label="PID is enabled:">
          <q-toggle
            :value="block.data.enabled"
            @change="v => { block.data.enabled = v; saveBlock(); }"
          />
        </q-field>
        <q-field label="Input" orientation="vertical">
          <p>
            <span>The input target value and actual value will come from:</span>
            <LinkPopupEdit
              :field="block.data.inputId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.inputId = v)"
              label="Input"
              class="inline-popup"
            />
          </p>
          <p>
            <span>
              The current target value is
              <b>{{ block.data.inputSetting | unit }}</b>
              and the actual value is
              <b>{{ block.data.inputValue | unit }}</b>.
            </span>
          </p>
        </q-field>
        <q-field label="Output" orientation="vertical">
          <p>
            <span>The PID result will be used to drive:</span>
            <LinkPopupEdit
              :field="block.data.outputId"
              :service-id="block.serviceId"
              :change="callAndSaveBlock(v => block.data.outputId = v)"
              label="Output"
              class="inline-popup"
            />
          </p>
          <p>
            <span>
              The current target value of the output is
              <b>{{ block.data.outputSetting | round }}</b>
              and the actually achieved value is
              <b>{{ block.data.outputValue | round }}</b>.
            </span>
          </p>
        </q-field>
        <q-field class="col" label="Filtering" orientation="vertical">
          <p>
            <span>Input changes faster than</span>
            <SelectPopupEdit
              :field="block.data.filter"
              :change="callAndSaveBlock(v => block.data.filter = v)"
              :options="filterOpts"
              label="Filter"
              class="inline-popup"
            />
            <span>will be filtered out.</span>
          </p>
          <p>
            <span>But steps exceeding</span>
            <UnitPopupEdit
              :field="block.data.filterThreshold"
              :change="callAndSaveBlock(v => block.data.filterThreshold = v)"
              label="Filter threshold"
              class="inline-popup"
            />
            <span>will trigger a faster response.</span>
          </p>
        </q-field>
      </div>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="help" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
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
  grid-auto-flow: column;
  grid-template-rows: auto auto auto auto;
  grid-template-columns: auto auto auto auto auto auto;
  grid-gap: 15px;
}

.calculation /deep/ .q-field-content {
  padding-top: 6px;
}
</style>

