<script lang="ts">
import { prettyLink } from '@/utils/quantity';
import { AnalogConstraintBase, AnalogConstraints } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
import { prettyConstraints, prettyLimitations } from '../../utils/formatting';

export default defineComponent({
  name: 'AnalogConstraintsField',
  props: {
    modelValue: {
      type: Object as PropType<AnalogConstraints>,
      default: () => ({}),
    },
    serviceId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const constraints = computed<AnalogConstraints>(() => props.modelValue);

    const isConstrained = computed<boolean>(() => {
      const { min, max, balanced } = constraints.value;
      return [min, max, balanced].some((v) => v?.enabled);
    });

    function constraintClass(constraint: AnalogConstraintBase): string[] {
      const cls: string[] = [];
      if (constraint.limiting) {
        cls.push('text-pink-4');
      } else if (constraint.enabled) {
        cls.push('text-indigo-4');
      } else {
        cls.push('darkish');
      }
      return cls;
    }

    return {
      prettyLink,
      prettyConstraints,
      prettyLimitations,
      constraints,
      isConstrained,
      constraintClass,
    };
  },
});
</script>

<template>
  <div class="q-ma-sm q-pa-sm q-gutter-x-sm row">
    <div
      v-if="!isConstrained"
      class="text-italic darkish text-small"
    >
      No constraints set
    </div>

    <div
      v-if="constraints.min?.enabled"
      :class="constraintClass(constraints.min)"
    >
      Minimum: {{ constraints.min.value }}
    </div>
    <div
      v-if="constraints.max?.enabled"
      :class="constraintClass(constraints.max)"
    >
      Maximum: {{ constraints.max.value }}
    </div>
    <div
      v-if="constraints.balanced?.enabled"
      :class="constraintClass(constraints.balanced)"
    >
      Balanced: {{ prettyLink(constraints.balanced.balancerId) }}
    </div>
  </div>
</template>
