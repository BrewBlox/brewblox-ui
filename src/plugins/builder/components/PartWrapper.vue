<script lang="ts">
import { useBuilderStore } from '@/plugins/builder/store';
import { FlowPart } from '@/plugins/builder/types';
import { coord2grid, coord2translate } from '@/plugins/builder/utils';
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
    posX: {
      type: Number,
      default: 0,
    },
    posY: {
      type: Number,
      default: 0,
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

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

    const positionTransform = computed<string>(() =>
      coord2translate(props.posX, props.posY),
    );

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
      if (props.part.flipped) {
        return `translate(${coord2grid(sizeX.value)}, 0) scale(-1, 1)`;
      }
      return '';
    });

    return {
      component,
      dimensions,
      positionTransform,
      rotateTransform,
      flipTransform,
    };
  },
});
</script>

<template>
  <g :transform="positionTransform">
    <g :transform="`${rotateTransform} ${flipTransform}`">
      <g :class="{ interactable, selectable, selected }">
        <rect
          class="select-background"
          :width="dimensions.width"
          :height="dimensions.height"
        />
        <component
          :is="component"
          v-if="component"
          :part="part"
          :width="dimensions.width"
          :height="dimensions.height"
          class="builder-part"
          v-bind="$attrs"
        />
      </g>
    </g>
  </g>
</template>

<style lang="sass">
/* not scoped */

.builder-part
  pointer-events: none
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

.interactable > .builder-part
  pointer-events: all

.selectable
  pointer-events: bounding-box

.select-background
  opacity: 0

.selectable:hover > .select-background
  fill: silver
  fill-opacity: 0.5
  opacity: 0.5

.selected > .select-background
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

.interaction
  cursor: pointer

.interaction > .interaction-background
  width: 100%
  height: 100%
  opacity: 0
  rx: 4

.interaction:hover > .interaction-background
  fill: silver
  fill-opacity: 0.5
  opacity: 0.5
</style>
