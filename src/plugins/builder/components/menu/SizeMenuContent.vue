<script lang="ts">
import { usePart } from '@/plugins/builder/composables';
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent, PropType } from 'vue';
import { HEIGHT_KEY, WIDTH_KEY } from '../../const';

export default defineComponent({
  name: 'SizeMenuContent',
  props: {
    min: {
      type: Object as PropType<AreaSize>,
      required: true,
    },
    max: {
      type: Object as PropType<AreaSize>,
      required: true,
    },
    default: {
      type: Object as PropType<AreaSize>,
      required: true,
    },
  },
  setup(props) {
    const { settings, patchSettings } = usePart.setup();

    const size = computed<AreaSize>(() => ({
      width: settings.value[WIDTH_KEY] ?? props.default.width,
      height: settings.value[HEIGHT_KEY] ?? props.default.height,
    }));

    function showSizeDialog(): void {
      createDialog({
        component: 'AreaSizeDialog',
        componentProps: {
          title: 'Part size',
          message: 'The part is scaled to fit the new dimensions.',
          modelValue: size.value,
          min: props.min,
          max: props.max,
        },
      }).onOk(({ width, height }: AreaSize) => {
        patchSettings({
          [WIDTH_KEY]: width,
          [HEIGHT_KEY]: height,
        });
      });
    }

    return {
      size,
      showSizeDialog,
    };
  },
});
</script>

<template>
  <q-item
    v-close-popup
    clickable
    @click="showSizeDialog"
  >
    <q-item-section>Size</q-item-section>
    <q-item-section side> {{ size.width }} x {{ size.height }} </q-item-section>
  </q-item>
</template>
