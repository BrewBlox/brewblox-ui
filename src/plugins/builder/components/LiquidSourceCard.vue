<script lang="ts">
import {
  BEER,
  COLD_WATER,
  DEPRECATED_IO_PRESSURE_KEY,
  HOT_WATER,
  IO_ENABLED_KEY,
  IO_LIQUIDS_KEY,
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

    const color = computed<string | null>({
      get: () => settings.value[IO_LIQUIDS_KEY]?.[0] ?? null,
      set: (v) => {
        const liquids = v ? [colorString(v)] : [];
        patchSettings({ [IO_LIQUIDS_KEY]: liquids });
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
