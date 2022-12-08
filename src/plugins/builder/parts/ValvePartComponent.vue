<script lang="ts">
import {
  RIGHT,
  ValveBlockT,
  VALVE_CLOSED_KEY,
  VALVE_KEY,
  VALVE_TYPES,
} from '@/plugins/builder/const';
import { useSparkStore } from '@/plugins/spark/store';
import { DigitalState } from 'brewblox-proto/ts';
import { computed, defineComponent, watch } from 'vue';
import { usePart, useSettingsBlock } from '../composables';
import { flowOnCoord, liquidOnCoord, scheduleSoftStartRefresh } from '../utils';

const paths = {
  outerValve: [
    'M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50',
    'M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50',
  ],
  innerValve: [
    'M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z',
    'M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z',
  ],
  openLiquid: ['m0,25h50'],
  closedLiquid: ['m0,25h19', 'm31,25h50'],
  arrows: 'M0,25H50',
};

export default defineComponent({
  name: 'ValvePartComponent',
  setup() {
    const sparkStore = useSparkStore();

    const { part, settings, width, height, patchSettings, reflow } =
      usePart.setup();

    const { hasAddress, block, blockStatus, isBroken } =
      useSettingsBlock.setup<ValveBlockT>(part, VALVE_KEY, VALVE_TYPES);

    const flowSpeed = computed<number>(() => flowOnCoord(part.value, RIGHT));

    const liquids = computed<string[]>(() => liquidOnCoord(part.value, RIGHT));

    const closed = computed<boolean>(() =>
      hasAddress.value
        ? block.value?.data.state !== DigitalState.STATE_ACTIVE
        : Boolean(settings.value[VALVE_CLOSED_KEY]),
    );

    const pending = computed<boolean>(() =>
      hasAddress.value
        ? block.value?.data.desiredState !== block.value?.data.state
        : false,
    );

    const valveRotation = computed<number>(() => {
      if (!hasAddress.value) {
        return closed.value ? 90 : 0;
      }
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
    });

    watch(
      () => block.value,
      (newV, oldV) => {
        if (hasAddress.value && newV?.data.state !== oldV?.data.state) {
          reflow();
        }
      },
    );

    function interact(): void {
      if (hasAddress.value) {
        if (block.value) {
          const storedState =
            block.value.data.state === DigitalState.STATE_INACTIVE
              ? DigitalState.STATE_ACTIVE
              : DigitalState.STATE_INACTIVE;
          sparkStore.patchBlock(block.value, { storedState });

          scheduleSoftStartRefresh(block.value);
        }
      } else {
        patchSettings({
          [VALVE_CLOSED_KEY]: !settings.value[VALVE_CLOSED_KEY],
        });
      }
    }

    return {
      width,
      height,
      blockStatus,
      paths,
      hasAddress,
      isBroken,
      flowSpeed,
      liquids,
      closed,
      pending,
      valveRotation,
      interact,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
    <BlockStatusSvg :status="blockStatus" />
    <UnlinkedSvgIcon
      v-if="isBroken"
      x="0"
      y="0"
      height="15"
      width="15"
    />
    <foreignObject
      v-if="pending"
      x="3"
      y="3"
      height="44"
      width="44"
    >
      <q-spinner
        size="44px"
        class="col"
        color="blue-grey-5"
      />
    </foreignObject>
    <g
      key="valve-outer"
      class="outline"
    >
      <path :d="paths.outerValve[0]" />
      <path :d="paths.outerValve[1]" />
    </g>
    <LiquidStroke
      v-if="closed"
      :paths="paths.closedLiquid"
      :colors="liquids"
    />
    <LiquidStroke
      v-else
      :paths="paths.openLiquid"
      :colors="liquids"
    />
    <g
      key="valve-inner"
      :transform="`rotate(${valveRotation}, 25, 25)`"
      class="fill outline inner"
    >
      <path :d="paths.innerValve[0]" />
      <path :d="paths.innerValve[1]" />
      <PowerIcon
        v-if="hasAddress"
        color="black"
      />
    </g>
    <AnimatedArrows
      key="valve-arrows"
      :speed="flowSpeed"
      :path="paths.arrows"
    />
  </svg>
</template>
