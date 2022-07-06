<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { fieldLabels } from '@/plugins/tilt/const';
import { useTiltStore } from '@/plugins/tilt/store';
import { TiltFieldIndex, TiltStateValue } from '@/plugins/tilt/types';
import { fixedNumber, prettyQty, shortDateString } from '@/utils/quantity';

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
  setup(props) {
    const tiltStore = useTiltStore();

    function saveName(name: string | null): void {
      if (name) {
        tiltStore.saveDeviceName(props.state.id, name);
      }
    }

    return {
      fixedNumber,
      shortDateString,
      prettyQty,
      fieldClass,
      fieldLabels,
      saveName,
    };
  },
});
</script>

<template>
  <div class="row">
    <InputField
      v-if="!hidden.name"
      :label="fieldLabels.name"
      :title="fieldLabels.name"
      :class="fieldClass"
      :model-value="state.name"
      :rules="[
        (v) => !!v || 'Name must not be empty',
        (v) =>
          /^[a-zA-Z0-9 _\-\(\)\|]*$/.test(v || '') ||
          'Name may only contain letters, numbers, spaces, and ()-_|',
        (v) => v.length < 100 || 'Name must be less than 100 characters',
      ]"
      html
      message="
      <p>History data for Tilt devices is published by device name.</p>
      <p>
        If you update a device name,
        you will need to update Graph widgets to use the new name.
      </p>
      "
      @update:model-value="saveName"
    />

    <LabeledField
      v-if="!hidden.color"
      :label="fieldLabels.color"
      :class="fieldClass"
    >
      {{ state.color }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.temperature"
      :label="fieldLabels.temperature"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.temperature) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.uncalibratedTemperature"
      :label="fieldLabels.uncalibratedTemperature"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.uncalibratedTemperature) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.specificGravity"
      :label="fieldLabels.specificGravity"
      :class="fieldClass"
    >
      {{ fixedNumber(state.data.specificGravity, 3) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.uncalibratedSpecificGravity"
      :label="fieldLabels.uncalibratedSpecificGravity"
      :class="fieldClass"
    >
      {{ fixedNumber(state.data.uncalibratedSpecificGravity, 3) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.plato"
      :label="fieldLabels.plato"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.plato, 0) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.uncalibratedPlato"
      :label="fieldLabels.uncalibratedPlato"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.uncalibratedPlato) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.mac"
      :label="fieldLabels.mac"
      :class="fieldClass"
    >
      {{ state.mac }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.rssi"
      :label="fieldLabels.rssi"
      :class="fieldClass"
    >
      {{ prettyQty(state.data.rssi) }}
    </LabeledField>

    <LabeledField
      v-if="!hidden.timestamp"
      :label="fieldLabels.timestamp"
      :class="fieldClass"
    >
      {{ shortDateString(state.timestamp) }}
    </LabeledField>
  </div>
</template>
