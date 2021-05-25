<script lang="ts">
import { debounce } from 'quasar';
import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'SizeCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    settingsKey: {
      type: String,
      required: true,
    },
    defaultSize: {
      type: Number,
      required: true,
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: 'Size',
    },
  },
  emits: [
    'update:part',
  ],
  setup(props, { emit }) {
    const size = computed<number>(
      () => {
        const val = props.part.settings[props.settingsKey];
        return (typeof val === 'number') ? val : props.defaultSize;
      },
    );

    const save = debounce((val: number): void => {
      const size = (typeof val === 'number') ? val : props.defaultSize;
      emit('update:part', {
        ...props.part,
        settings: {
          ...props.part.settings,
          [props.settingsKey]: size,
        },
      });
    }, 50, true);

    return {
      size,
      save,
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
      <q-slider :model-value="size" :min="min" :max="max" label @change="save" />
    </q-item-section>
  </q-item>
</template>
