<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { Unit } from '@/helpers/units';
import { ProcessValueLink, ActuatorAnalogLink } from '@/helpers/units/KnownLinks';
import { filters } from './getters';
import { Block } from '@/plugins/spark/state';
import { PidBlock } from '@/plugins/spark/features/Pid/state';

@Component
export default class PidForm extends BlockForm {
  get defaultData() {
    return {};
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
  <div class="pid-modal">
    <q-card>
      <q-card-title>
        PID calculation
      </q-card-title>
      <q-card-main class="calculation">
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
        <div />
        <!-- operators -->
        <div />
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <div />

        <!-- extra *Kp -->
        <div />
        <q-field label="Kp" orientation="vertical">
          <big class="unimportant">{{ block.data.kp | unit }}</big>
        </q-field>
        <q-field label="Kp" orientation="vertical">
          <big class="unimportant">{{ block.data.kp | unit }}</big>
        </q-field>
        <div />

        <!-- operators -->
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>/</big>
        </q-field>
        <q-field label=" " orientation="vertical">
          <big>*</big>
        </q-field>
        <div />

        <!-- settings -->
        <q-field label="Kp" orientation="vertical">
          <UnitPopupEdit label="Kp" :field="block.data.kp" :change="callAndSaveBlock(v => block.data.kp = v)" />
        </q-field>
        <q-field label="Ti" orientation="vertical">
          <UnitPopupEdit label="Ti" :field="block.data.ti" :change="callAndSaveBlock(v => block.data.ti = v)" />
        </q-field>
        <q-field label="Td" orientation="vertical">
          <UnitPopupEdit label="Td" :field="block.data.td" :change="callAndSaveBlock(v => block.data.td = v)" />
        </q-field>
        <div />

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
        <div />

        <!-- result -->
        <q-field label="P" orientation="vertical">
          <big>{{ block.data.p | round }}</big>
        </q-field>
        <q-field label="I" orientation="vertical">
          <big>{{ block.data.i | round }}</big>
        </q-field>
        <q-field label="D" orientation="vertical" style="border-bottom: solid 2px white; min-width: 60px;">
          <big>{{ block.data.d | round }}</big>
          <big style="float: right;"><sub>+</sub></big>
        </q-field>
        <div>
          <big>{{ block.data.outputValue | round }}</big>
        </div>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>
        Input and output
      </q-card-title>
      <q-card-main class="input-output">
        <q-field label="Input" orientation="vertical">
          <p>
            <span>The input target value and actual value will come from:</span>
            <LinkPopupEdit label="Input" :field="block.data.inputId" :serviceId="block.serviceId" :change="callAndSaveBlock(v => block.data.inputId = v)" class="inline-popup" />
          </p>
          <p>
            <span>
              The current target value is <b>{{block.data.inputSetting | unit}}</b>
              and the actual value is <b>{{block.data.inputValue | unit}}</b>.
            </span>
          </p>
        </q-field>

        <q-field label="Output" orientation="vertical">
          <p>
            <span>The PID result will be used to drive: </span>
            <LinkPopupEdit label="Output" :field="block.data.outputId" :serviceId="block.serviceId" :change="callAndSaveBlock(v => block.data.outputId = v)" class="inline-popup" />
          </p>
          <p>
            <span>
              The current setting of the output is <b>{{block.data.outputSetting | unit}}</b>
              and the actually achieved value is <b>{{block.data.outputValue | unit}}</b>.
            </span>
          </p>
        </q-field>
        <q-field class="col" label="Filtering" orientation="vertical">
          <p>
            <span>Input changes faster than</span>
            <SelectPopupEdit label="Filter" :field="block.data.filter" :change="callAndSaveBlock(v => block.data.filter = v)" :options="filterOpts" class="inline-popup" />
            <span>will be filtered out.</span>
          </p>
          <p>
            <span>But steps exceeding</span>
            <UnitPopupEdit label="Filter threshold" :field="block.data.filterThreshold" :change="callAndSaveBlock(v => block.data.filterThreshold = v)" class="inline-popup" />
            <span>will trigger a faster response.</span>
          </p>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>
        Other settings
      </q-card-title>
      <q-card-main class="other-settings">
        <q-field label="Block is active in profiles:">
          <SelectPopupEdit label="Profiles" multiple :field="block.profiles" :options="profileOpts" :change="callAndSaveBlock(v => block.profiles = v)" />
        </q-field>

        <q-field label="PID is enabled:">
          <q-toggle :value="block.data.enabled" @change="v => { block.data.enabled = v; saveBlock(); }" />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>
        The PID block
      </q-card-title>
      <q-card-main>
        <p>
          A PID block can drives its output to regulate its input.
          The input is a process value, in most cases this will be a pair of a setpoint and sensor.
          The difference between the setpoint and the sensor is called the <i>error</i>.
        </p>
        <p>
          The output value is the sum of 3 parts derived from the error: proportional, integral and derivative.<br />
        </p>
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
          This is the purpose of the integral part of PID, to correct <i>steady state errors</i>.
        </p>
        <p>
          It will take Ti seconds for the integral part to become as large as the proportional part.
          If Ti is too small, the integral will do work that should be hanlded by the proportional part.
          Because the integral is slow to increase <i>and decrease</i>,
          a low Ti can cause too much actuator action after reaching the setpoint.<br />
        </p>
        <p>
          Setting Ti to zero will disable the integrator.
        </p>
        <div class="q-subheading">Derivative</div>
        <p>
          Td can be seen as the duration of the overshoot that can be expected due to inertia in the system.
          The role of the derivative part is to prevent this overshoot.
          If the input is quickly approaching the target, the derivative can decrease the output for a slower approach.
        </p>
        <p>
          When there is no overshoot in the system, Td should be set to zero.
        </p>

        <div class="q-subheading">Filtering</div>
        <p>
          The error value is passed through a filter to remove noise, spikes and sudden jumps.<br />
          The amount of filtering can be configured.
          You should set the filter to the minimum duration of signal changes that you wish to let through unfiltered.
        </p>
        <p>
          The filter can detect steps in the input signal and temporarily respond faster.
          The threshold for steps that trigger this faster response can be configured too.
        </p>
      </q-card-main>
    </q-card>
  </div>
</template>

<style lang="stylus" scoped>
@import '../../../../css/app.styl';

.pid-modal {
  display: flex;
  flex-wrap: wrap;
  max-width: 800px;
  align-items: center;
  padding: 10px;
}

.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}

.section {
  padding: 20px;
}

/deep/ .q-card-title {
  color: $secondary;
}

.q-subheading {
  color: $tertiary;
}

.section {
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

.emphasize {
  font-weight: bold;
  padding: 10px;
}

.inline-popup {
  display: inline-block;
  margin: 0px 10px;
}
</style>

