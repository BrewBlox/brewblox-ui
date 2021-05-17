<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ListMultiSelect',
  props: {
    modelValue: {
      type: Array as PropType<any[]>,
      required: true,
    },
    options: {
      type: Array as PropType<any[]>,
      required: true,
    },
    optionValue: {
      type: String,
      default: 'id',
    },
    optionLabel: {
      type: String,
      default: 'title',
    },
    dense: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    function matches(val: any): boolean {
      const key = val[props.optionValue];
      return props.modelValue.some(v => v[props.optionValue] === key);
    }

    function selectValue(val: any): void {
      const key = val[props.optionValue];
      // Check if value already selected
      const updated = props.modelValue.filter(v => v[props.optionValue] !== key);
      // Add if it was not
      if (updated.length === props.modelValue.length) {
        updated.push(val);
      }
      emit('update:modelValue', updated);
    }

    return {
      matches,
      selectValue,
    };
  },
});
</script>

<template>
  <div class="q-gutter-y-sm">
    <div
      v-for="opt in options"
      :key="opt[optionValue]"
      :class="[
        'col clickable q-pl-sm rounded-borders text-h6',
        {'q-py-sm': !dense, 'depth-24': matches(opt)}
      ]"
      @click="selectValue(opt)"
    >
      <slot name="body" :opt="opt">
        <div class="row q-gutter-x-sm">
          <ToggleButton :model-value="matches(opt)" dense flat />
          <div class="self-center">
            {{ opt[optionLabel] }}
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>
