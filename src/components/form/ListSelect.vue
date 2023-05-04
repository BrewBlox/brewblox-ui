<script setup lang="ts">
import isObject from 'lodash/isObject';
import { computed, PropType } from 'vue';

const props = defineProps({
  modelValue: {
    type: [Object, String, Number, Symbol] as PropType<any>,
    default: null,
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
  optionClass: {
    type: [String, Array, Object],
    default: '',
  },
  emitValue: {
    type: Boolean,
    default: false,
  },
  dense: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'update:model-value', value: any | null): void;
  (e: 'confirm', value: any): void;
}>();

const mappedOptions = computed<any[]>(() =>
  props.options.map((opt) =>
    isObject(opt)
      ? opt
      : {
          [props.optionValue]: opt,
          [props.optionLabel]: opt,
        },
  ),
);

function matches(opt: any): boolean {
  const model = props.modelValue;
  const optValue = opt[props.optionValue];
  if (model === null) {
    return false;
  } else {
    return props.emitValue
      ? optValue === model
      : optValue === model[props.optionValue];
  }
}

function selectValue(opt: any, save: boolean): void {
  const value = props.emitValue ? opt[props.optionValue] : opt;
  if (save) {
    emit('confirm', value);
  } else if (matches(opt)) {
    emit('update:model-value', null);
  } else {
    emit('update:model-value', value);
  }
}
</script>

<template>
  <div class="q-gutter-y-sm">
    <div
      v-for="opt in mappedOptions"
      :key="opt[optionValue]"
      :class="[
        'col clickable q-px-sm rounded-borders text-h6',
        optionClass,
        { 'q-py-sm': !dense, 'depth-24': matches(opt) },
      ]"
      @click="selectValue(opt, false)"
      @dblclick="selectValue(opt, true)"
    >
      <slot
        name="body"
        :opt="opt"
      >
        {{ opt[optionLabel] }}
        <template v-if="opt.badge">
          <q-badge
            class="q-ml-sm"
            color="info"
          >
            {{ opt.badge }}
          </q-badge>
        </template>
      </slot>
    </div>
  </div>
</template>
