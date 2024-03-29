<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import { computed, watch } from 'vue';
import {
  UP,
  VALVE_CLOSED_KEY,
  VALVE_KEY,
  VALVE_TYPES,
  ValveBlockT,
} from '@/plugins/builder/const';
import { elbow, flowOnCoord, liquidOnCoord } from '@/plugins/builder/utils';
import { usePart, useSettingsBlock } from '../composables';

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

const { part, flows, settings, width, height, patchSettings, reflow } =
  usePart.setup();

const {
  hasAddress,
  block,
  patchBlock,
  blockStatus,
  isBroken,
  showBlockDialog,
  showBlockSelectDialog,
} = useSettingsBlock.setup<ValveBlockT>(VALVE_KEY, VALVE_TYPES);

const closed = computed<boolean>(() =>
  block.value !== null
    ? Boolean(block.value.data.state === DigitalState.STATE_ACTIVE)
    : Boolean(settings.value[VALVE_CLOSED_KEY]),
);

const liquidPath = computed<string>(() =>
  closed.value ? paths.liquidLeft : paths.liquidRight,
);

const liquidSpeed = computed<number>(
  () => -flowOnCoord(part.value, flows.value, UP),
);

const liquidColor = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, UP),
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

watch(
  () => block.value,
  (newV, oldV) => {
    if (hasAddress.value && newV?.data.state !== oldV?.data.state) {
      reflow();
    }
  },
);
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
    <LiquidStroke
      :paths="[liquidPath]"
      :colors="liquidColor"
    />
    <AnimatedArrows
      :path="liquidPath"
      :speed="liquidSpeed"
    />
    <g
      class="outline fill"
      :transform="closed ? 'translate(50, 0) scale(-1, 1)' : ''"
    >
      <path d="M0,21 H10" />
      <path d="M0,29 H10" />
      <path :d="paths.bigEnclosure" />
      <path :d="paths.smallEnclosure" />
    </g>
    <PowerSvgIcon
      v-if="block"
      :x="closed ? 25 : 15"
      y="25"
      color="black"
    />
    <BuilderInteraction @interact="toggle">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
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
