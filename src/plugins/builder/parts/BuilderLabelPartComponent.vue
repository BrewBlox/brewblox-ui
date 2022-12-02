<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../composables';
import { FlowPart } from '../types';
import { coord2grid } from '../utils';

export default defineComponent({
  name: 'BuilderLabelPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: [...usePart.emits],
  setup(props) {
    const { sizeX, sizeY, patchSettings } = usePart.setup(props.part);

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

    const text = computed<string>(
      () => props.part.settings.text || '[click to edit]',
    );

    const fontSize = computed<number>(() => props.part.settings.fontSize || 16);

    function interact(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: props.part.settings.text ?? '',
          title: 'Edit label',
          label: 'text',
        },
      }).onOk((text) => patchSettings({ text }));
    }

    return {
      dimensions,
      text,
      fontSize,
      interact,
    };
  },
});
</script>

<template>
  <svg
    :width="dimensions.width"
    :height="dimensions.height"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
    <foreignObject class="fit">
      <div
        class="fit text-bold q-pa-sm"
        :style="{ 'font-size': `${fontSize}pt` }"
      >
        {{ text }}
      </div>
    </foreignObject>
  </svg>
</template>
