<script lang="ts">
import isArray from 'lodash/isArray';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'SelectCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Block',
    },
    opts: {
      type: [Array, Function] as PropType<
        SelectOption[] | (() => SelectOption[])
      >,
      required: true,
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const model = computed({
      get: () => props.part.settings[props.settingsKey] ?? null,
      set: (v) =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            [props.settingsKey]: v,
          },
        }),
    });

    const options = computed<SelectOption[]>(() => {
      if (isArray(props.opts)) {
        return props.opts;
      } else {
        return props.opts();
      }
    });

    return {
      model,
      options,
    };
  },
});
</script>

<template>
  <SelectField
    v-model="model"
    :options="options"
    :title="label"
    :label="label"
    item-aligned
  />
</template>
