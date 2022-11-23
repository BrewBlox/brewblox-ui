<script lang="ts">
import {
  colorString,
  coord2grid,
  textTransformation,
} from '@/plugins/builder/utils';
import { computed, defineComponent, PropType } from 'vue';
import { DEFAULT_FILL_PCT } from '../blueprints/Kettle';
import { usePart } from '../composables';
import { FlowPart } from '../types';

export default defineComponent({
  name: 'KettlePartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    const titleText = computed<string>(() => props.part.settings.text ?? '');

    const filledSquares = computed<number>(() => {
      const pct = props.part.settings.fillPct ?? DEFAULT_FILL_PCT;
      return pct * (sizeY.value / 100);
    });

    const color = computed<string>(() =>
      colorString(props.part.settings.color),
    );

    return {
      textTransformation,
      coord2grid,
      titleText,
      filledSquares,
      color,
      sizeX,
      sizeY,
    };
  },
});
</script>

<template>
  <g>
    <rect
      :fill="color"
      :x="2"
      :y="coord2grid(sizeY - filledSquares) + 2"
      :width="coord2grid(sizeX) - 4"
      :height="coord2grid(filledSquares) - 4"
      rx="2"
      ry="2"
    />
    <g class="outline">
      <rect
        :width="coord2grid(sizeX) - 4"
        :height="coord2grid(sizeY) - 4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
    </g>
    <foreignObject
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
      :transform="textTransformation(part, [sizeX, sizeY], false)"
    >
      <div
        class="fit builder-text"
        style="font-size: 130%; padding-top: 15px"
      >
        {{ titleText }}
      </div>
    </foreignObject>
  </g>
</template>
