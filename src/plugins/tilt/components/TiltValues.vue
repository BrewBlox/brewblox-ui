<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { TiltFieldIndex, TiltStateValue } from '@/plugins/tilt/types';
import { fixedNumber, prettyQty, shortDateString } from '@/utils';

const fieldClass = 'col-5 col-grow q-my-none';

export default defineComponent({
  name: 'TiltValues',
  props: {
    state: {
      type: Object as PropType<TiltStateValue>,
      required: true,
    },
    hidden: {
      type: Object as PropType<Partial<TiltFieldIndex>>,
      default: () => ({}),
    },
  },
  setup() {
    return {
      fixedNumber,
      shortDateString,
      prettyQty,
      fieldClass,
    };
  },
});
</script>

<template>
  <div class="row">
    <LabeledField
      v-if="!hidden.temperature"
      label="Temperature"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.temperature) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedTemperature"
      label="Temperature (calibrated)"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.calibratedTemperature) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.specificGravity"
      label="SG"
      :class="fieldClass"
    >
      {{ fixedNumber(state.data.specificGravity, 3) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedSpecificGravity"
      label="SG (calibrated)"
      :class="fieldClass"
    >
      {{ fixedNumber(state.data.calibratedSpecificGravity, 3) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.plato"
      label="Plato"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.plato, 0) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedPlato"
      label="Plato (calibrated)"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.calibratedPlato) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.signalStrength"
      label="Signal strength"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.signalStrength) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.timestamp"
      label="Published"
      :class="fieldClass"
    >
      {{ shortDateString(state.timestamp) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.color"
      label="Color"
      :class="fieldClass"
    >
      {{ state.color }}
    </LabeledField>
  </div>
</template>
