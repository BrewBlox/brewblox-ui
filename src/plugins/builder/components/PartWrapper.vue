<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import { FlowPart } from '@/plugins/builder/types';
import { squares } from '@/plugins/builder/utils';
import { Coordinates, rotatedSize } from '@/utils/coordinates';

import parts from '../parts';
import { builderStore } from '../store';

export default defineComponent({
  name: 'PartWrapper',
  components: {
    ...parts,
  },
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
    showHover: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {

    const component = computed<string>(
      () => builderStore.component(props.part),
    );

    const rotateTransform = computed<string>(
      () => {
        const [partSizeX, partSizeY] = props.part.size;
        const [renderSizeX, renderSizeY] = rotatedSize(props.part.rotate, props.part.size);

        const farEdge = new Coordinates([partSizeX, partSizeY, 0])
          .rotate(props.part.rotate, [0, 0, 0]);

        const trX = farEdge.x < 0 ? squares(renderSizeX) : 0;
        const trY = farEdge.y < 0 ? squares(renderSizeY) : 0;

        return `translate(${trX}, ${trY}) rotate(${props.part.rotate})`;
      },
    );

    const flipTransform = computed<string>(
      () => {
        if (!props.part.flipped) {
          return '';
        }
        const sizeX = props.part.size[0];
        return `translate(${squares(sizeX)}, 0) scale(-1, 1)`;
      },
    );

    const transformation = computed<string>(
      () => `${rotateTransform.value} ${flipTransform.value}`,
    );

    return {
      squares,
      component,
      transformation,
    };
  },
});
</script>

<template>
  <g :transform="transformation">
    <component
      :is="component"
      v-if="component"
      :model-value="part"
      class="BuilderPart"
      v-bind="$attrs"
    />
    <!-- background element, to make the full part clickable -->
    <rect
      :width="squares(part.size[0])"
      :height="squares(part.size[1])"
      :class="{showhover: showHover, selected}"
      opacity="0"
    />
  </g>
</template>

<style lang="sass">
/* not scoped */

.BuilderPart
  stroke-width: 2px
  stroke-linecap: round
  fill: none

  .fill
    fill: #fff

  .outline
    stroke: #fff

  .text
    stroke-width: 1px
    stroke: #fff

  .liquid
    stroke-width: 7px

.showhover:hover
  fill: silver
  fill-opacity: 0.5
  opacity: 0.5

.selected
  fill: dodgerblue
  fill-opacity: 0.5
  opacity: 0.5
</style>
