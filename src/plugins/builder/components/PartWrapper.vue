<script lang="ts">
import { useBuilderStore } from '@/plugins/builder/store';
import { FlowPart } from '@/plugins/builder/types';
import { coord2grid, coord2translate } from '@/plugins/builder/utils';
import { Coordinates, rotatedSize } from '@/utils/coordinates';
import { computed, defineComponent, PropType, provide } from 'vue';
import { PartKey, ReflowKey } from '../const';
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
    /**
     * Rendered X position (in coordinates).
     * This is not required to be equal to `part.x`.
     */
    coordX: {
      type: Number,
      default: 0,
    },
    /**
     * Rendered Y position (in coordinates).
     * This is not required to be equal to `part.y`.
     */
    coordY: {
      type: Number,
      default: 0,
    },
    /**
     * Mouse events for the wrapped part are enabled.
     */
    interactable: {
      type: Boolean,
      default: false,
    },
    /**
     * The part is highlighted on hover.
     */
    selectable: {
      type: Boolean,
      default: false,
    },
    /**
     * The part is actively selected, and should be highlighted.
     */
    selected: {
      type: Boolean,
      default: false,
    },
    /**
     * Mouse events for the wrapped part are disabled.
     * The 'preselect' event is emitted on click.
     */
    preselectable: {
      type: Boolean,
      default: false,
    },
    /**
     * The part is inaccessible, and should be faded.
     */
    inactive: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:part', 'preselect', 'reflow'],
  setup(props, { emit }) {
    const builderStore = useBuilderStore();
    const component = builderStore.componentByType(props.part.type);

    const providedPart = computed<FlowPart>({
      get: () => props.part,
      set: (v) => emit('update:part', v),
    });

    provide(PartKey, providedPart);
    provide(ReflowKey, () => emit('reflow'));

    const sizeX = computed<number>(() => props.part.size[0]);
    const sizeY = computed<number>(() => props.part.size[1]);

    const dimensions = computed(() => ({
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

    const positionTransform = computed<string>(() =>
      coord2translate(props.coordX, props.coordY),
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

    function preselect(): void {
      emit('preselect');
    }

    return {
      component,
      dimensions,
      positionTransform,
      rotateTransform,
      flipTransform,
      preselect,
    };
  },
});
</script>

<template>
  <g :transform="positionTransform">
    <g :transform="`${rotateTransform} ${flipTransform}`">
      <g :class="{ interactable, selectable, selected, inactive }">
        <component
          :is="component"
          v-if="component"
          class="builder-part"
        />
        <rect
          class="select-background"
          :width="dimensions.width"
          :height="dimensions.height"
        />
        <rect
          v-if="preselectable"
          :width="dimensions.width"
          :height="dimensions.height"
          class="preselect-foreground"
          @click.stop="preselect"
        />
      </g>
    </g>
  </g>
</template>

<style lang="sass">
/* not scoped */
.interactable > .builder-part
  pointer-events: all

.selectable > .builder-part
  pointer-events: none

.selectable > .select-background
  cursor: pointer
  pointer-events: all

.select-background
  pointer-events: none
  opacity: 0
  rx: 4

.selectable:hover > .select-background
  fill: white
  opacity: 0.2

.selected > .select-background
  fill: dodgerblue
  opacity: 0.5

.inactive
  opacity: 0.25 !important

.preselect-foreground
  fill: white
  opacity: 0

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
  fill: white
  opacity: 0.2

// Generic styling for all part components
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
</style>
