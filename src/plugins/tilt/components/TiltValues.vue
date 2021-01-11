<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { TiltFieldIndex, TiltStateValue } from '@/plugins/tilt/types';


@Component
export default class TiltValues extends Vue {
  fieldClass = 'col-5 col-grow q-my-none'

  @Prop({ type: Object, required: true })
  public readonly value!: TiltStateValue;

  @Prop({ type: Object, default: () => ({}) })
  public readonly hidden!: Partial<TiltFieldIndex>;

}
</script>

<template>
  <div class="row">
    <LabeledField
      v-if="!hidden.temperature"
      label="Temperature"
      :class="fieldClass"
    >
      {{ value.data.temperature | quantity }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedTemperature"
      label="Temperature (calibrated)"
      :class="fieldClass"
    >
      {{ value.data.calibratedTemperature | quantity }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.specificGravity"
      label="SG"
      :class="fieldClass"
    >
      {{ value.data.specificGravity | round(3) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedSpecificGravity"
      label="SG (calibrated)"
      :class="fieldClass"
    >
      {{ value.data.calibratedSpecificGravity | round(3) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.plato"
      label="Plato"
      :class="fieldClass"
    >
      {{ value.data.plato | quantity(0) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedPlato"
      label="Plato (calibrated)"
      :class="fieldClass"
    >
      {{ value.data.calibratedPlato | quantity }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.signalStrength"
      label="Signal strength"
      :class="fieldClass"
    >
      {{ value.data.signalStrength | quantity }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.timestamp"
      label="Published"
      :class="fieldClass"
    >
      {{ value.timestamp | shortDateString }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.color"
      label="Color"
      :class="fieldClass"
    >
      {{ value.color }}
    </LabeledField>
  </div>
</template>
