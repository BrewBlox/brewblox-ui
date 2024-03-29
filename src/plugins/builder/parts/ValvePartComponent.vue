<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import { computed, watch } from 'vue';
import {
  RIGHT,
  VALVE_CLOSED_KEY,
  VALVE_KEY,
  VALVE_TYPES,
  ValveBlockT,
} from '@/plugins/builder/const';
import { usePart, useSettingsBlock } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

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

const { part, flows, settings, width, height, patchSettings, reflow } =
  usePart.setup();

const {
  hasAddress,
  block,
  blockStatus,
  isBroken,
  isClaimed,
  patchBlock,
  showBlockDialog,
  showBlockSelectDialog,
} = useSettingsBlock.setup<ValveBlockT>(VALVE_KEY, VALVE_TYPES);

const flowSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, RIGHT),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, RIGHT),
);

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
  if (isBroken.value) {
    return 45;
  }
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

function toggle(): void {
  if (hasAddress.value) {
    if (block.value) {
      const storedState =
        block.value.data.state === DigitalState.STATE_INACTIVE
          ? DigitalState.STATE_ACTIVE
          : DigitalState.STATE_INACTIVE;
      patchBlock({ storedState }, true);
    }
  } else {
    patchSettings({
      [VALVE_CLOSED_KEY]: !settings.value[VALVE_CLOSED_KEY],
    });
  }
}
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <BrokenSvgIcon
      v-if="isBroken"
      x="0"
      y="0"
      height="15"
      width="15"
    />
    <BlockStatusSvg
      v-else
      :status="blockStatus"
    />
    <SpinnerSvgIcon
      v-if="pending"
      r="18"
    />
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
    <g class="outline">
      <path :d="paths.outerValve[0]" />
      <path :d="paths.outerValve[1]" />
    </g>
    <g
      :transform="`rotate(${valveRotation}, 25, 25)`"
      class="outline fill"
    >
      <path :d="paths.innerValve[0]" />
      <path :d="paths.innerValve[1]" />
      <PowerSvgIcon
        v-if="hasAddress"
        color="black"
        x="20"
        y="10.5"
      />
    </g>
    <AnimatedArrows
      key="valve-arrows"
      :speed="flowSpeed"
      :path="paths.arrows"
    />
    <BuilderInteraction @interact="toggle">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item
            v-close-popup
            :disable="isBroken || isClaimed"
            clickable
            @click="toggle"
          >
            <q-item-section>Toggle</q-item-section>
          </q-item>
          <BlockMenuContent
            :available="!!block"
            @show="showBlockDialog"
            @assign="showBlockSelectDialog"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
