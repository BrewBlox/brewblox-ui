<script lang="ts">
import { BEER, COLD_WATER, HOT_WATER, WORT } from '@/plugins/builder/const';
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent, PropType } from 'vue';
import { FlowPart } from '../types';

const presetColors: string[] = [COLD_WATER, HOT_WATER, BEER, WORT];

export default defineComponent({
  name: 'LiquidSourceCard',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: ['update:part'],
  setup(props, { emit }) {
    const pressured = computed<boolean>({
      get: () =>
        props.part.settings.enabled ?? Boolean(props.part.settings.pressure),
      set: (enabled) =>
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            enabled,
          },
        }),
    });

    const color = computed<string | null>({
      get: () => props.part.settings.liquids?.[0] ?? null,
      set: (v) => {
        const liquids = v ? [colorString(v)] : [];
        emit('update:part', {
          ...props.part,
          settings: {
            ...props.part.settings,
            liquids,
          },
        });
      },
    });

    function toggle(c: string): void {
      color.value = c !== color.value ? c : null;
    }

    return {
      pressured,
      presetColors,
      color,
      toggle,
    };
  },
});
</script>

<template>
  <div class="row q-gutter-x-md q-pl-sm">
    <LabeledField
      label="Enabled"
      class="col-auto min-width-sm"
    >
      <q-toggle
        v-model="pressured"
        dense
      />
    </LabeledField>
    <ColorField
      v-model="color"
      clearable
      title="Liquid color"
      label="Color"
      message="Choose a fill color for this source."
      class="col-auto"
    />
    <q-btn
      v-for="colorOpt in presetColors"
      :key="colorOpt"
      :style="`background-color: ${colorOpt}`"
      :size="color == colorOpt ? 'lg' : 'md'"
      round
      icon="format_color_fill"
      class="self-center"
      @click="toggle(colorOpt)"
    />
  </div>
</template>
