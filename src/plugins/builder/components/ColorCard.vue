<script lang="ts">
import { BEER, COLD_WATER, HOT_WATER, WORT } from '@/plugins/builder/const';
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';

const presetColors: string[] = [COLD_WATER, HOT_WATER, BEER, WORT];

export default defineComponent({
  name: 'ColorCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const color = computed<string | null>({
      get: () => props.part.settings.color,
      set: (c) =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            color: colorString(c),
          },
        }),
    });

    function toggle(c: string): void {
      color.value = c !== color.value ? c : null;
    }

    return {
      presetColors,
      color,
      toggle,
    };
  },
});
</script>

<template>
  <div class="row q-gutter-x-md q-pl-sm">
    <ColorField
      v-model="color"
      clearable
      title="Liquid color"
      label="Custom"
      message="Select the fill color for this part."
      class="col-auto"
    />
    <q-btn
      v-for="colorOpt in presetColors"
      :key="colorOpt"
      :style="`background-color: ${colorOpt}`"
      :size="color == colorOpt ? 'lg' : 'md'"
      :color="colorOpt"
      round
      icon="format_color_fill"
      class="self-center"
      @click="toggle(colorOpt)"
    />
  </div>
</template>
