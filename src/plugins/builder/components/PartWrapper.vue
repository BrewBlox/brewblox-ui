<script lang="ts">
import { useBuilderStore } from '@/plugins/builder/store';
import { FlowPart } from '@/plugins/builder/types';
import { coord2grid } from '@/plugins/builder/utils';
import { Coordinates, rotatedSize } from '@/utils/coordinates';
import { computed, defineComponent, PropType } from 'vue';
import { usePart } from '../composables';
import parts from '../parts';

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
    interactable: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const builderStore = useBuilderStore();
    const { sizeX, sizeY } = usePart.setup(props.part);
    const component = builderStore.componentByType(props.part.type);

    const rotateTransform = computed<string>(() => {
      const [partSizeX, partSizeY] = props.part.size;
      const [renderSizeX, renderSizeY] = rotatedSize(
        props.part.rotate,
        props.part.size,
      );

      const farEdge = new Coordinates([partSizeX, partSizeY, 0]).rotate(
        props.part.rotate,
        [0, 0, 0],
      );

      const trX = farEdge.x < 0 ? coord2grid(renderSizeX) : 0;
      const trY = farEdge.y < 0 ? coord2grid(renderSizeY) : 0;

      return `translate(${trX}, ${trY}) rotate(${props.part.rotate})`;
    });

    const flipTransform = computed<string>(() => {
      if (!props.part.flipped) {
        return '';
      }
      return `translate(${coord2grid(sizeX.value)}, 0) scale(-1, 1)`;
    });

    const transformation = computed<string>(
      () => `${rotateTransform.value} ${flipTransform.value}`,
    );

    return {
      coord2grid,
      sizeX,
      sizeY,
      component,
      transformation,
    };
  },
});
</script>

<template>
  <g
    :transform="transformation"
    :class="{ interactable, selectable, selected }"
  >
    <rect
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
      class="background"
      opacity="0"
    />
    <component
      :is="component"
      v-if="component"
      :part="part"
      :class="['BuilderPart']"
      :style="{ 'pointer-events': interactable ? 'all' : 'none' }"
      v-bind="$attrs"
    />
  </g>
</template>

<style lang="sass">
/* not scoped */


.BuilderPart
  stroke-linecap: round
  fill: none

  text
    fill: #fff

  .fill
    fill: #fff

  .outline
    stroke-width: 2px
    stroke: #fff

  .text
    stroke-width: 1px
    stroke: #fff

  .liquid
    stroke-width: 7px

  .q-icon
    stroke-width: 0

.selectable
  pointer-events: bounding-box

.selectable:hover > .background
  fill: silver
  fill-opacity: 0.5
  opacity: 0.5

.selected > .background
  fill: dodgerblue
  fill-opacity: 0.5
  opacity: 0.5

.builder-text
  font-size: 12px
  font-weight: 500
  text-align: center
  line-height: 1
  vertical-align: middle
  display: inline-block
</style>
