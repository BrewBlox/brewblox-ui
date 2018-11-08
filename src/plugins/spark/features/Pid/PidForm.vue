<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { Unit } from '@/helpers/units';
import { ProcessValueLink, ActuatorAnalogLink } from '@/helpers/units/KnownLinks';
import { filters } from './getters';

@Component
export default class PidForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      inputId: { path: 'data.inputId', default: new ProcessValueLink(null) },
      outputId: { path: 'data.outputId', default: new ActuatorAnalogLink(null) },
      filter: { path: 'data.filter', default: 0 },
      filterThreshold: { path: 'data.filterThreshold', default: new Unit(0, 'delta_degC') },
      enabled: { path: 'data.enabled', default: false },
      kp: { path: 'data.kp', default: new Unit(0, 'celsius') },
      ti: { path: 'data.ti', default: new Unit(0, 'second') },
      td: { path: 'data.td', default: new Unit(0, 'second') },
    };
  }

  get filterOpts() {
    return filters.map((filter, idx) => ({ label: filter, value: idx }));
  }

  afterBlockFetch() {
    this.fetchCompatibleToInputLinks();
  }
}
</script>

<template>
  <div>
    <div class="calculation">
      <!-- state -->
      <q-field
        label="Filtered Error"
        orientation="vertical"
      >
        <big>{{ block.data.error | unit }}</big>
      </q-field>
      <q-field
        label="Integral"
        orientation="vertical"
      >
        <big>{{ block.data.integral | unit }}</big>
      </q-field>
      <q-field
        label="Derivative"
        orientation="vertical"
      >
        <big>{{ block.data.derivative | unit }}</big>
      </q-field>
      <div />
      <!-- operators -->
      <div />
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>*</big>
      </q-field>
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>*</big>
      </q-field>
      <div />

      <!-- extra *Kp -->
      <div />
      <q-field
        label="Kp"
        orientation="vertical"
      >
        <big style="color: grey;">{{ block.data.kp | unit }}</big>
      </q-field>
      <q-field
        label="Kp"
        orientation="vertical"
      >
        <big style="color: grey;">{{ block.data.kp | unit }}</big>
      </q-field>
      <div />

      <!-- operators -->
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>*</big>
      </q-field>
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>/</big>
      </q-field>
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>*</big>
      </q-field>
      <div />

      <!-- settings -->
      <q-field
        label="Kp"
        orientation="vertical"
      >
        <UnitPopupEdit
          label="Kp"
          :field="block.data.kp"
          :change="v => { block.data.kp = v; this.saveBlock(); }"
        />
      </q-field>
      <q-field
        label="Ti"
        orientation="vertical"
      >
        <UnitPopupEdit
        label="Ti"
        :field="block.data.ti"
        :change="v => { block.data.ti = v; this.saveBlock(); }"
      />
      </q-field>
      <q-field
        label="Td"
        orientation="vertical"
      >
        <UnitPopupEdit
          label="Td"
          :field="block.data.td"
          :change="v => { block.data.td = v; this.saveBlock(); }"
        />
      </q-field>
      <div />

      <!-- equal signs -->
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>=</big>
      </q-field>
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>=</big>
      </q-field>
      <q-field
        label=" "
        orientation="vertical"
      >
        <big>=</big>
      </q-field>
      <div />

      <!-- result -->
      <q-field
        label="P"
        orientation="vertical"
      >
        <big>{{ block.data.p | round }}</big>
      </q-field>
      <q-field
        label="I"
        orientation="vertical"
      >
        <big>{{ block.data.i | round }}</big>
      </q-field>
      <q-field
        label="D"
        orientation="vertical"
        style="border-bottom: solid 2px white; min-width: 60px;"
      >
        <big>{{ block.data.d | round }}</big>
        <big style="float: right;"><sub>+</sub></big>
      </q-field>
      <div>
      <big>{{ block.data.outputValue | round }}</big>
      </div>
    </div>
    <widget-field
      label="Active profiles"
      icon="settings_input_component"
    >
      <profiles-bar
        v-model="inputValues.profiles"
        :profileNames="profileNames"
      />
    </widget-field>

    <widget-field
      label="Enabled"
      icon="edit"
    >
      <q-toggle
        v-model="inputValues.enabled"
      />
    </widget-field>

    <widget-field
      label="Input / Output"
      icon="edit"
    >
      <q-select
        v-model="inputValues.inputId.id"
        stack-label="Input"
        clearable
        :options="linkOpts(inputValues.inputId)"
      />
      <q-select
        v-model="inputValues.outputId.id"
        stack-label="Output"
        clearable
        :options="linkOpts(inputValues.outputId)"
      />
    </widget-field>

    <widget-field
      label="Filter"
      icon="edit"
    >
      <q-select
        v-model="inputValues.filter"
        stack-label="Filter"
        :options="filterOpts"
      />
      <q-input
        v-model="inputValues.filterThreshold.value"
        stack-label="Threshold"
        type="number"
      />
    </widget-field>
  </div>
</template>

<style scoped>
.calculation {
  display: grid;
  place-content: center;
  grid-auto-flow: column;
  grid-template-rows: auto auto auto auto;
  grid-template-columns: auto auto auto auto auto auto;
  grid-gap: 15px;
}
.calculation /deep/ .q-field-content {
  padding-top: 6px;
}
</style>

