<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'ToggleCard',
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
      required: true,
    },
    defaultValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const value = computed<boolean>({
      get: () =>
        Boolean(props.part.settings[props.settingsKey] ?? props.defaultValue),
      set: (v) =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            [props.settingsKey]: v,
          },
        }),
    });

    return {
      value,
    };
  },
});
</script>

<template>
  <q-item class="q-ma-none q-mt-xs">
    <q-item-section>
      <q-item-label caption>
        {{ label }}
      </q-item-label>
      <q-toggle v-model="value" />
    </q-item-section>
  </q-item>
</template>
