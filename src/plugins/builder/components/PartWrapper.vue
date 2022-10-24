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
  <g :transform="transformation">
    <component
      :is="component"
      v-if="component"
      :part="part"
      class="BuilderPart"
      v-bind="$attrs"
    />
    <!-- background element, to make the full part clickable -->
    <rect
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
      :class="{ showhover: showHover, selected }"
      opacity="0"
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

.showhover:hover
  fill: silver
  fill-opacity: 0.5
  opacity: 0.5

.selected
  fill: dodgerblue
  fill-opacity: 0.5
  opacity: 0.5
</style>
