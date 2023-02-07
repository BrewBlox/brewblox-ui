<script lang="ts">
import { useField } from '@/composables';
import { prettyLink } from '@/utils/quantity';
import { AnalogConstraintBase, AnalogConstraints } from 'brewblox-proto/ts';
import { defineComponent, PropType } from 'vue';
import { prettyConstraints, prettyLimitations } from '../../utils/formatting';

export default defineComponent({
  name: 'AnalogConstraintsField',
  props: {
    ...useField.props,
    modelValue: {
      type: Object as PropType<AnalogConstraints>,
      default: () => ({}),
    },
    title: {
      type: String,
      default: 'Edit constraints',
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup() {
    function constraintStyle(constraint?: AnalogConstraintBase): string[] {
      const style: string[] = ['text-small'];
      if (!constraint) {
        style.push('darkish');
      } else if (constraint.limiting) {
        style.push('text-pink-4');
      } else if (constraint.enabled) {
        style.push('text-indigo-4');
      } else {
        style.push('darkish');
      }
      return style;
    }

    return {
      prettyLink,
      prettyConstraints,
      prettyLimitations,
      constraintStyle,
    };
  },
});
</script>

<template>
  <div class="q-ma-sm q-pa-sm q-gutter-x-sm row clickable rounded-borders">
    <q-icon
      name="mdi-border-outside"
      class="col-auto"
      size="sm"
    />
    <div class="col-auto">
      <!-- <small>{{ prettyConstraints(modelValue) }}</small> -->
      <div
        v-if="modelValue.min"
        :class="constraintStyle(modelValue.min)"
      >
        Minimum: {{ modelValue.min?.value }}
      </div>
      <div
        v-if="modelValue.max"
        :class="constraintStyle(modelValue.max)"
      >
        Maximum: {{ modelValue.max?.value }}
      </div>
      <div
        v-if="modelValue.balanced"
        :class="constraintStyle(modelValue.balanced)"
      >
        Balanced: {{ prettyLink(modelValue.balanced?.balancerId) }}
      </div>
    </div>
    <!--
        <small
        v-if="limiters.length"
      >
        Limited by:
        <i>{{ limiters.join(', ') }}</i>
      </small>
      <small v-else-if="numConstraints > 0">
        {{ numConstraints }} constraint(s), not limited
      </small>
      <small v-else> No constraints configured</small>
    </div>
    -->
    <!-- <q-tooltip v-if="numConstraints > 0">
      {{ displayString }}
    </q-tooltip> -->
  </div>
</template>
