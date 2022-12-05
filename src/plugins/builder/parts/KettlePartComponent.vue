<script lang="ts">
import { colorString, textTransformation } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { DEFAULT_FILL_PCT } from '../blueprints/Kettle';
import { usePart } from '../composables';

export default defineComponent({
  name: 'KettlePartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    const titleText = computed<string>(() => props.part.settings.text ?? '');

    const labelTransform = computed<string>(() =>
      textTransformation(props.part, [sizeX.value, sizeY.value], false),
    );

    const filledHeight = computed<number>(() => {
      const pct = props.part.settings.fillPct ?? DEFAULT_FILL_PCT;
      return pct * (props.height / 100);
    });

    const color = computed<string>(() =>
      colorString(props.part.settings.color),
    );

    return {
      titleText,
      labelTransform,
      filledHeight,
      color,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <rect
      :fill="color"
      :x="2"
      :y="height - filledHeight + 2"
      :width="width - 4"
      :height="filledHeight - 4"
      rx="2"
      ry="2"
    />
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
