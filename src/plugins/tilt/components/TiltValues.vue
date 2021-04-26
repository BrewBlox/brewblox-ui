<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { TiltFieldIndex, TiltStateValue } from '@/plugins/tilt/types';
import { prettyQty } from '@/utils/bloxfield';
import { round, shortDateString } from '@/utils/functional';

const fieldClass = 'col-5 col-grow q-my-none';

export default defineComponent({
  name: 'TiltValues',
  props: {
    value: {
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
      round,
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
      {{ prettyQty(value.data.temperature) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedTemperature"
      label="Temperature (calibrated)"
      :class="fieldClass"
    >
      {{ prettyQty(value.data.calibratedTemperature) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.specificGravity"
      label="SG"
      :class="fieldClass"
    >
      {{ round(value.data.specificGravity, 3) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedSpecificGravity"
      label="SG (calibrated)"
      :class="fieldClass"
    >
      {{ round(value.data.calibratedSpecificGravity, 3) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.plato"
      label="Plato"
      :class="fieldClass"
    >
      {{ prettyQty(value.data.plato, 0) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.calibratedPlato"
      label="Plato (calibrated)"
      :class="fieldClass"
    >
      {{ prettyQty(value.data.calibratedPlato) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.signalStrength"
      label="Signal strength"
      :class="fieldClass"
    >
      {{ prettyQty(value.data.signalStrength) }}
    </LabeledField>
    <LabeledField
      v-if="!hidden.timestamp"
      label="Published"
      :class="fieldClass"
    >
      {{ shortDateString(value.timestamp) }}
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
