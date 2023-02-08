<script lang="ts">
import { useField } from '@/composables';
import { prettyLink } from '@/utils/quantity';
import { AnalogConstraintBase, AnalogConstraints } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType } from 'vue';
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
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const constraints = computed<AnalogConstraints>({
      get: () => props.modelValue,
      set: (v) => emit('update:modelValue', v),
    });

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
  <div class="q-ma-sm q-pa-sm q-gutter-x-sm row clickable rounded-borders">
    <q-icon
      name="mdi-border-outside"
      class="col-auto"
      size="sm"
    />
    <div class="col-auto">
      <div
        v-if="!isConstrained"
        class="text-italic darkish"
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
