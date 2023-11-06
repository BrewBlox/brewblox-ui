<script setup lang="ts">
import { prettyLink } from '@/utils/quantity';
import { AnalogConstraintBase, AnalogConstraints } from 'brewblox-proto/ts';
import { computed } from 'vue';

interface Props {
  modelValue?: AnalogConstraints;
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({}),
});

const isConstrained = computed<boolean>(() => {
  const { min, max, balanced } = props.modelValue;
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
      v-if="modelValue.min?.enabled"
      :class="constraintClass(modelValue.min)"
    >
      Minimum: {{ modelValue.min.value }}
    </div>
    <div
      v-if="modelValue.max?.enabled"
      :class="constraintClass(modelValue.max)"
    >
      Maximum: {{ modelValue.max.value }}
    </div>
    <div
      v-if="modelValue.balanced?.enabled"
      :class="constraintClass(modelValue.balanced)"
    >
      Balanced: {{ prettyLink(modelValue.balanced.balancerId) }}
    </div>
  </div>
</template>
