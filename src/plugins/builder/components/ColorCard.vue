<script lang="ts">
import {
  BEER,
  COLD_WATER,
  COLOR_KEY,
  HOT_WATER,
  WORT,
} from '@/plugins/builder/const';
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const presetColors: string[] = [COLD_WATER, HOT_WATER, BEER, WORT];

export default defineComponent({
  name: 'ColorCard',
  props: {
    settingsKey: {
      type: String,
      default: COLOR_KEY,
    },
  },
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    const color = computed<string | null>({
      get: () => settings.value[props.settingsKey],
      set: (c) => patchSettings({ [props.settingsKey]: colorString(c) }),
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
      :presets="presetColors"
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
