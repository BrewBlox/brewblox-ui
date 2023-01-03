<script lang="ts">
import { usePart } from '@/plugins/builder/composables';
import {
  BEER,
  COLD_WATER,
  DEFAULT_IO_PRESSURE,
  HOT_WATER,
  IO_LIQUIDS_KEY,
  IO_PRESSURE_KEY,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  WORT,
} from '@/plugins/builder/const';
import { colorString } from '@/plugins/builder/utils';
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';

const presetColors: string[] = [COLD_WATER, HOT_WATER, BEER, WORT];

export default defineComponent({
  name: 'LiquidSourceMenuContent',
  setup() {
    const { settings, patchSettings, pressured } = usePart.setup();

    const pressure = computed<number>(
      () => settings.value[IO_PRESSURE_KEY] ?? DEFAULT_IO_PRESSURE,
    );

    const color = computed<string>(
      () => settings.value[IO_LIQUIDS_KEY]?.[0] ?? '',
    );

    const indicatorStyle = computed<Mapped<string | undefined>>(() => ({
      backgroundColor: color.value,
      border: `1px ${color.value ? 'solid' : 'dashed'} white`,
      borderRadius: '50%',
      height: '15px',
      width: '15px',
    }));

    function editColor(): void {
      createDialog({
        component: 'ColorDialog',
        componentProps: {
          modelValue: color.value,
          title: 'Fill color',
          message: 'Choose a fill color for this source.',
          clearable: true,
          presets: presetColors,
        },
      }).onOk((v) => {
        const liquids = v ? [colorString(v)] : [];
        patchSettings({ [IO_LIQUIDS_KEY]: liquids });
      });
    }

    return {
      IO_PRESSURE_KEY,
      MIN_IO_PRESSURE,
      MAX_IO_PRESSURE,
      DEFAULT_IO_PRESSURE,
      pressured,
      pressure,
      color,
      indicatorStyle,
      editColor,
    };
  },
});
</script>

<template>
  <q-item
    v-ripple
    v-close-popup
    tag="label"
  >
    <q-item-section>
      <q-item-label>Active</q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-toggle v-model="pressured" />
    </q-item-section>
  </q-item>
  <q-item
    v-close-popup
    clickable
    @click="editColor"
  >
    <q-item-section>Color</q-item-section>
    <q-item-section class="items-end q-pr-md">
      <span :style="indicatorStyle" />
    </q-item-section>
  </q-item>
  <PressureMenuContent
    :settings-key="IO_PRESSURE_KEY"
    :min="MIN_IO_PRESSURE"
    :max="MAX_IO_PRESSURE"
    :default="DEFAULT_IO_PRESSURE"
  />
</template>
