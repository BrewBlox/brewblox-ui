<script lang="ts">
import range from 'lodash/range';
import { debounce } from 'quasar';
import { PropType, computed, defineComponent } from 'vue';

import { FlowPart } from '../types';

export default defineComponent({
  name: 'ScaleCard',
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
      type: Array as unknown as PropType<[number, number]>,
      required: true,
    },
    minSize: {
      type: Number,
      default: 1,
    },
    maxSize: {
      type: Number,
      default: 15,
    },
    label: {
      type: String,
      default: 'Scale',
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const scales = computed<number[]>(() => {
      const [defaultX, defaultY] = props.defaultSize;
      const [big, small] =
        defaultY > defaultX ? [defaultY, defaultX] : [defaultX, defaultY];

      // We only want scale values where both X and Y size are integer
      // Iterate between small === minSize and big === maxSize
      // Step size ensures small is integer
      // Filter all values where the scaled big is not integer
      return range(props.minSize, Math.floor(props.maxSize * (small / big)) + 1)
        .map((smallScaled) => smallScaled / small)
        .filter((scale) => (big * scale) % 1 === 0);
    });

    const index = computed<number>(() => {
      const scale = props.part.settings[props.settingsKey] ?? 1;
      const idx = scales.value.findIndex((v) => v === scale);
      return Math.max(idx, 0);
    });

    const save = debounce(
      (idx: number): void =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            [props.settingsKey]: scales.value[idx],
          },
        }),
      50,
      true,
    );

    return {
      scales,
      index,
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
      <q-slider
        :model-value="index"
        :min="0"
        :max="scales.length - 1"
        markers
        @change="save"
      />
    </q-item-section>
  </q-item>
</template>
