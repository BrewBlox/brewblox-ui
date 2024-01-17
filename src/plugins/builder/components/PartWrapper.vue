<script setup lang="ts">
import { computed, onErrorCaptured, provide, ref } from 'vue';
import { useBuilderStore } from '@/plugins/builder/store';
import { BuilderPart } from '@/plugins/builder/types';
import { coord2grid, coord2translate } from '@/plugins/builder/utils';
import { Coordinates, rotatedSize } from '@/utils/coordinates';
import { notify } from '@/utils/notify';
import parts from '../parts';
import {
  InteractableKey,
  PartKey,
  PatchPartKey,
  PatchSettingsKey,
  ReflowKey,
} from '../symbols';

interface Props {
  part: BuilderPart;

  /**
   * Mouse events for the wrapped part are enabled.
   */
  interactable?: boolean;

  /**
   * The part is highlighted on hover.
   */
  selectable?: boolean;

  /**
   * The part is actively selected, and should be highlighted.
   */
  selected?: boolean;

  /**
   * Mouse events for the wrapped part are disabled.
   * The 'preselect' event is emitted on click.
   */
  preselectable?: boolean;

  /**
   * Element is darkened and non-interactable.
   */
  dimmed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  interactable: false,
  selectable: false,
  selected: false,
  preselectable: false,
  dimmed: false,
});

const emit = defineEmits<{
  'patch:part': [payload: Partial<BuilderPart>];
  'patch:settings': [payload: Partial<BuilderPart['settings']>];
  preselect: [];
  reflow: [];
}>();

const builderStore = useBuilderStore();
const component = parts[builderStore.componentByType(props.part.type)];

provide(ReflowKey, () => emit('reflow'));
provide(
  PartKey,
  computed<BuilderPart>(() => props.part),
);
provide(
  InteractableKey,
  computed(() => props.interactable),
);

provide(PatchPartKey, (patch) => emit('patch:part', patch));
provide(PatchSettingsKey, (patch) => emit('patch:settings', patch));

const error = ref<string>();

const dimensions = computed(() => ({
  width: coord2grid(props.part.width),
  height: coord2grid(props.part.height),
}));

const positionTransform = computed<string>(() =>
  coord2translate(props.part.x, props.part.y),
);

const rotateTransform = computed<string>(() => {
  const { width, height } = props.part;
  const renderSize = rotatedSize(props.part.rotate, props.part);

  const farEdge = new Coordinates([width, height, 0]).rotate(
    props.part.rotate,
    [0, 0, 0],
  );

  const trX = farEdge.x < 0 ? coord2grid(renderSize.width) : 0;
  const trY = farEdge.y < 0 ? coord2grid(renderSize.height) : 0;

  return `translate(${trX}, ${trY}) rotate(${props.part.rotate})`;
});

const flipTransform = computed<string>(() => {
  if (props.part.flipped) {
    return `translate(${coord2grid(props.part.width)}, 0) scale(-1, 1)`;
  }
  return '';
});

onErrorCaptured((err: Error) => {
  error.value = err.message;
  const { type, x, y } = props.part;
  notify.error(`${type} (${x},${y}) :${err.message}`);
  return false;
});
</script>

<template>
  <g
    v-if="!error"
    :transform="positionTransform"
  >
    <g :transform="`${rotateTransform} ${flipTransform}`">
      <g
        :class="[
          'builder-part-wrapper',
          {
            interactable,
            selectable,
            selected,
            preselectable,
            dimmed,
          },
        ]"
      >
        <rect
          class="selection-overlay"
          :width="dimensions.width"
          :height="dimensions.height"
        />
        <g class="builder-part">
          <component
            :is="component"
            v-if="component"
          />
        </g>
        <rect
          class="selection-highlight"
          :width="dimensions.width"
          :height="dimensions.height"
        />
        <rect
          v-if="preselectable && !interactable"
          :width="dimensions.width"
          :height="dimensions.height"
          class="preselection-overlay"
          @click.stop="$emit('preselect')"
        />
      </g>
    </g>
  </g>
</template>

<style lang="sass" scoped>
.builder-part-wrapper
  pointer-events: none

  > .selection-overlay
    opacity: 0

  > .selection-highlight
    opacity: 0
    rx: 4

  > .preselection-overlay
    pointer-events: all
    fill: white
    opacity: 0

  &.selectable
    > .selection-overlay
      pointer-events: auto

  &.selectable:hover
    > .selection-highlight
      fill: white
      opacity: 0.2

  &.selected
    > .selection-highlight
      fill: dodgerblue
      opacity: 0.5

  &.selected.selectable:hover
    > .selection-highlight
      fill: shade(dodgerblue, 4)
      opacity: 0.5

  &.dimmed
    opacity: 0.1 !important

:deep(.builder-part)
  pointer-events: none
  stroke-linecap: round
  fill: none

  &:hover
    .interaction:hover > .interaction-highlight
      opacity: 0.2
      fill: white
      background-color: white
      rx: 4

  text
    fill: white

  .builder-text
    font-size: 12px
    font-weight: 500
    text-align: center
    line-height: 1
    vertical-align: middle
    display: inline-block

  :not(.interactable) .native-interaction
    pointer-events: none !important

  .fill
    fill: white

  .outline
    stroke-width: 2
    stroke: white
</style>
