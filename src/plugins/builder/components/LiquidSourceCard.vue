<script lang="ts">
import {
  BEER,
  COLD_WATER,
  COLOR_KEY,
  DEPRECATED_IO_LIQUIDS_KEY,
  DEPRECATED_IO_PRESSURE_KEY,
  HOT_WATER,
  IO_ENABLED_KEY,
  WORT,
} from '@/plugins/builder/const';
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const presetColors: string[] = [COLD_WATER, HOT_WATER, BEER, WORT];

export default defineComponent({
  name: 'LiquidSourceCard',
  setup() {
    const { settings, patchSettings } = usePart.setup();

    const pressured = computed<boolean>({
      get: () =>
        Boolean(
          settings.value[IO_ENABLED_KEY] ??
            settings.value[DEPRECATED_IO_PRESSURE_KEY],
        ),
      set: (enabled) =>
        patchSettings({
          [IO_ENABLED_KEY]: enabled,
          [DEPRECATED_IO_PRESSURE_KEY]: undefined,
        }),
    });

    const color = computed<string>({
      get: () =>
        settings.value[COLOR_KEY] ??
        settings.value[DEPRECATED_IO_LIQUIDS_KEY]?.[0] ??
        '',
      set: (v) =>
        patchSettings({
          [COLOR_KEY]: colorString(v),
          [DEPRECATED_IO_LIQUIDS_KEY]: undefined,
        }),
    });

    function toggle(c: string): void {
      color.value = c !== color.value ? c : '';
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
