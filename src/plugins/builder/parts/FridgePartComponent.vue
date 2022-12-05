<script lang="ts">
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { coord2grid, textTransformation } from '../utils';

export default defineComponent({
  name: 'FridgePartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    const titleText = computed<string>(() => props.part.settings.text || '');

    const labelTransform = computed<string>(() =>
      textTransformation(props.part, [sizeX.value, sizeY.value], false),
    );

    const shelfHeight = computed<number>(() =>
      coord2grid(props.part.settings.shelfY || 1),
    );

    return {
      labelTransform,
      titleText,
      shelfHeight,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <g class="outline">
      <rect
        :width="width - 4"
        :height="height - 4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <!-- Top divider -->
      <line
        :x1="2"
        :y1="50"
        :x2="width - 4"
        :y2="50"
      />
      <!-- Bottom divider -->
      <line
        :x1="2"
        :y1="height - 50"
        :x2="width - 4"
        :y2="height - 50"
      />
      <!-- Shelf divider-->
      <line
        :x1="2"
        :y1="shelfHeight"
        :x2="width - 4"
        :y2="shelfHeight"
      />
    </g>
    <foreignObject
      :transform="labelTransform"
      class="fit"
    >
      <div
        class="fit builder-text"
        style="font-size: 130%; padding-top: 15px"
      >
        {{ titleText }}
      </div>
    </foreignObject>
  </svg>
</template>
