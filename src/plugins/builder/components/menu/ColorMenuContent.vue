<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import { usePart } from '../../composables';
import { BEER, COLD_WATER, HOT_WATER, WORT } from '../../const';

const presetColors: string[] = [COLD_WATER, HOT_WATER, BEER, WORT];

export default defineComponent({
  name: 'ColorMenuContent',
  setup() {
    const { color } = usePart.setup();

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
          title: 'Liquid color',
          message: 'Pick a liquid color.',
          clearable: true,
          presets: presetColors,
        },
      }).onOk((v) => {
        color.value = v;
      });
    }

    return {
      color,
      indicatorStyle,
      editColor,
    };
  },
});
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="editColor"
  >
    <q-item-section>Liquid color</q-item-section>
    <q-item-section class="items-end q-pr-md">
      <span :style="indicatorStyle" />
    </q-item-section>
  </q-item>
</template>
