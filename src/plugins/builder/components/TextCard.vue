<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'TextCard',
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
      default: 'Text field',
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const text = computed<string>({
      get: () => props.part.settings[props.settingsKey] ?? '',
      set: (val) =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            [props.settingsKey]: val,
          },
        }),
    });

    return {
      text,
    };
  },
});
</script>

<template>
  <InputField
    v-model="text"
    :title="label"
    :label="label"
    item-aligned
  />
</template>
