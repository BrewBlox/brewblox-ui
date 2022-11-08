<script lang="ts">
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
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

    const text = computed<string>(
      () => props.part.settings.text || '[click to edit]',
    );

    const fontSize = computed<number>(() => props.part.settings.fontSize || 16);

    return {
      dimensions,
      text,
      fontSize,
    };
  },
});
</script>

<template>
  <foreignObject
    :width="dimensions.width"
    :height="dimensions.height"
  >
    <div
      class="fit text-bold q-pa-sm"
      :style="{ 'font-size': `${fontSize}pt` }"
    >
      {{ text }}
    </div>
  </foreignObject>
</template>
