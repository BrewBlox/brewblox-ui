<script lang="ts">
import { UP } from '@/plugins/builder/const';
import {
  coord2grid,
  elbow,
  flowOnCoord,
  liquidOnCoord,
} from '@/plugins/builder/utils';
import { useSparkStore } from '@/plugins/spark/store';
import { DigitalState } from 'brewblox-proto/ts';
import { computed, defineComponent, PropType, watch } from 'vue';
import { ValveT, VALVE_KEY, VALVE_TYPES } from '../blueprints/LValve';
import { usePart, useSettingsBlock } from '../composables';
import { FlowPart } from '../types';

const paths = {
  bigEnclosure: `
    M21,0 V17 ${elbow(12, 12, false)} H50
    L39.5,29 c-1.4,5.1,-5.4,9.1,-10.5,10.5
    L21,39.5 c-5.1,-1.4,-9.1,-5.4,-10.5,-10.5
    L10.5,21 c1.4,-5.1,5.4,-9.1,10.5,-10.5`,
  smallEnclosure: `
    M29,0 V17 ${elbow(4, 4, false)} H50
    L39.5 21c-1.4-5.1-5.4-9.1-10.5-10.5`,
  liquidLeft: `M25,0 v17 ${elbow(-8, 8, false)} H0`,
  liquidRight: `M25,0 v17 ${elbow(8, 8, false)} H50`,
};

export default defineComponent({
  name: 'LValvePartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: [...usePart.emits],
  setup(props, { emit }) {
    const { sizeX, patchSettings } = usePart.setup(props.part);

    const { block } = useSettingsBlock.setup<ValveT>(
      props.part,
      VALVE_KEY,
      VALVE_TYPES,
    );

    const dimensions = computed(() => ({
      width: coord2grid(1),
      height: coord2grid(1),
    }));

    const closed = computed<boolean>(() =>
      block.value !== null
        ? Boolean(block.value.data.state === DigitalState.STATE_ACTIVE)
        : Boolean(props.part.settings.closed),
    );

    const liquidPath = computed<string>(() =>
      closed.value ? paths.liquidLeft : paths.liquidRight,
    );

    const liquidSpeed = computed<number>(() => -flowOnCoord(props.part, UP));

    const liquidColor = computed<string[]>(() => liquidOnCoord(props.part, UP));

    function interact(): void {
      if (block.value) {
        useSparkStore().patchBlock(block.value, {
          storedState:
            block.value.data.state === DigitalState.STATE_ACTIVE
              ? DigitalState.STATE_INACTIVE
              : DigitalState.STATE_ACTIVE,
        });
      } else {
        patchSettings({ closed: !props.part.settings.closed });
      }
    }

    watch(
      () => block.value,
      (newV, oldV) => {
        if (
          newV === null ||
          oldV === null ||
          newV.data.state !== oldV.data.state
        ) {
          emit('dirty');
        }
      },
    );

    return {
      paths,
      sizeX,
      block,
      dimensions,
      closed,
      liquidPath,
      liquidSpeed,
      liquidColor,
      interact,
    };
  },
});
</script>

<template>
  <svg
    :width="dimensions.width"
    :height="dimensions.height"
    viewBox="0 0 50 50"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
    <LiquidStroke
      :paths="[liquidPath]"
      :colors="liquidColor"
    />
    <g class="outline">
      <AnimatedArrows
        :path="liquidPath"
        :speed="liquidSpeed"
      />
    </g>
    <g
      class="outline fill"
      :transform="closed ? 'translate(50, 0) scale(-1, 1)' : ''"
    >
      <path d="M0,21 H10" />
      <path d="M0,29 H10" />
      <path :d="paths.bigEnclosure" />
      <path :d="paths.smallEnclosure" />
    </g>
    <PowerIcon
      v-if="block"
      :transform="`translate(${closed ? 5 : -5}, 15)`"
      color="black"
    />
  </svg>
</template>
