<script lang="ts">
import { computed, defineComponent, PropType, watch } from 'vue';

import { RIGHT } from '@/plugins/builder/const';
import { flowOnCoord, liquidOnCoord, settingsBlock, squares } from '@/plugins/builder/utils';
import { DigitalState } from '@/plugins/spark/types';

import { VALVE_KEY, VALVE_TYPES, ValveT } from '../specs/ActuatorValve';
import { FlowPart } from '../types';

const paths = {
  outerValve: [
    'M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50',
    'M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50',
  ],
  innerValve: [
    'M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z',
    'M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z',
  ],
  openLiquid: [
    'm0,25h50',
  ],
  closedLiquid: [
    'm0,25h19',
    'm31,25h50',
  ],
  arrows: 'M0,25H50',
};

export default defineComponent({
  name: 'ActuatorValve',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  emits: [
    'dirty',
  ],
  setup(props, { emit }) {

    const block = computed<ValveT | null>(
      () => settingsBlock(props.part, VALVE_KEY, VALVE_TYPES),
    );

    const flowSpeed = computed<number>(
      () => flowOnCoord(props.part, RIGHT),
    );

    const liquids = computed<string[]>(
      () => liquidOnCoord(props.part, RIGHT),
    );

    const closed = computed<boolean>(
      () => block.value?.data.state !== DigitalState.STATE_ACTIVE,
    );

    const pending = computed<boolean>(
      () => block.value?.data.desiredState !== block.value?.data.state,
    );

    const valveRotation = computed<number>(
      () => {
        switch (block.value?.data.state) {
          case undefined:
            return 90;
          case DigitalState.STATE_INACTIVE:
            return 90;
          case DigitalState.STATE_ACTIVE:
            return 0;
          default:
            return 45;
        }
      },
    );

    watch(
      () => block.value,
      (newV, oldV) => {
        if (newV === null
          || oldV === null
          || newV.data.state !== oldV.data.state) {
          emit('dirty');
        }
      },
    );

    return {
      squares,
      paths,
      block,
      flowSpeed,
      liquids,
      closed,
      pending,
      valveRotation,
    };
  },
});
</script>

<template>
  <g>
    <SvgEmbedded v-if="!block" height="15" width="15">
      <UnlinkedIcon size="15px" class="self-end" />
    </SvgEmbedded>
    <SvgEmbedded v-else-if="pending" :height="squares(1)" :width="squares(1)">
      <q-spinner size="44px" class="col" color="blue-grey-5" />
    </SvgEmbedded>
    <g key="valve-outer" class="outline">
      <path :d="paths.outerValve[0]" />
      <path :d="paths.outerValve[1]" />
    </g>
    <LiquidStroke v-if="closed" :paths="paths.closedLiquid" :colors="liquids" />
    <LiquidStroke v-else :paths="paths.openLiquid" :colors="liquids" />
    <g key="valve-inner" :transform="`rotate(${valveRotation}, 25, 25)`" class="fill outline inner">
      <path :d="paths.innerValve[0]" />
      <path :d="paths.innerValve[1]" />
      <PowerIcon color="black" />
    </g>
    <AnimatedArrows key="valve-arrows" :speed="flowSpeed" :path="paths.arrows" />
  </g>
</template>
