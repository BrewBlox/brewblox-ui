<script setup lang="ts">
import isObject from 'lodash/isObject';
import { VueClassProp } from 'quasar';
import { computed } from 'vue';

interface Props {
  modelValue: any;
  options: any[];
  optionValue?: string;
  optionLabel?: string;
  optionClass?: VueClassProp;
  emitValue?: boolean;
  dense?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  optionValue: 'id',
  optionLabel: 'title',
  optionClass: '',
  emitValue: false,
  dense: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: any | null];
  confirm: [value: any];
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
  if (opt.disable) {
    return;
  }
  const value = props.emitValue ? opt[props.optionValue] : opt;
  if (save) {
    emit('confirm', value);
  } else if (matches(opt)) {
    emit('update:modelValue', null);
  } else {
    emit('update:modelValue', value);
  }
}
</script>

<template>
  <div class="q-gutter-y-sm">
    <div
      v-for="opt in mappedOptions"
      :key="opt[optionValue]"
      :class="[
        'col q-px-sm rounded-borders text-h6 depth-1',
        optionClass,
        {
          'q-py-sm': !dense,
          'text-primary': matches(opt),
          clickable: !opt.disable,
          darkened: !!opt.disable,
          'fade-5': !!opt.disable,
          'not-allowed': !!opt.disable,
        },
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
        <template v-if="opt.tooltip">
          <q-tooltip>
            {{ opt.tooltip }}
          </q-tooltip>
        </template>
      </slot>
    </div>
  </div>
</template>
