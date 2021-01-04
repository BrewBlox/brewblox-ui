<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { TiltStateValue } from '@/plugins/tilt/types';


@Component
export default class TiltValues extends Vue {
  fieldClass = 'col q-my-none'

  @Prop({ type: Object, required: true })
  public readonly value!: TiltStateValue;

}
</script>

<template>
  <div class="row">
    <LabeledField
      label="Temperature"
      :class="fieldClass"
    >
      {{ value.data.temperature | quantity }}
    </LabeledField>
    <LabeledField
      label="Temperature (calibrated)"
      :class="fieldClass"
    >
      {{ value.data.calibratedTemperature | quantity }}
    </LabeledField>

    <div class="col-break" />

    <LabeledField
      label="SG"
      :class="fieldClass"
    >
      {{ value.data.specificGravity | round(3) }}
    </LabeledField>
    <LabeledField
      label="SG (calibrated)"
      :class="fieldClass"
    >
      {{ value.data.calibratedSpecificGravity | round(3) }}
    </LabeledField>

    <div class="col-break" />

    <LabeledField
      label="Plato"
      :class="fieldClass"
    >
      {{ value.data.plato | quantity(0) }}
    </LabeledField>
    <LabeledField
      label="Plato (calibrated)"
      :class="fieldClass"
    >
      {{ value.data.calibratedPlato | quantity }}
    </LabeledField>

    <div class="col-break" />

    <LabeledField
      label="Signal strength"
      :class="fieldClass"
    >
      {{ value.data.signalStrength | quantity }}
    </LabeledField>
    <LabeledField
      label="Published"
      :class="fieldClass"
    >
      {{ value.timestamp | shortDateString }}
    </LabeledField>

    <div class="col-break" />

    <LabeledField
      label="Color"
      :class="fieldClass"
    >
      {{ value.color }}
    </LabeledField>
  </div>
</template>
