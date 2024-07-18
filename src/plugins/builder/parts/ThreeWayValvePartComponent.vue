<script setup lang="ts">
import { computed } from 'vue';
import { DOWN, LEFT, RIGHT, VALVE_POSITION_KEY } from '@/plugins/builder/const';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const { part, flows, settings, width, height, patchSettings } = usePart.setup();

const valvePosition = computed<number>(
  () => settings.value[VALVE_POSITION_KEY] % 4 || 0,
);

const downSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, DOWN),
);

const leftSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, LEFT),
);

const rightSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, RIGHT),
);

const downLiquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, DOWN),
);

const leftLiquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, LEFT),
);

const rightLiquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, RIGHT),
);

function setPosition(pos: number): void {
  patchSettings({ [VALVE_POSITION_KEY]: pos % 4 });
}
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <LiquidStroke
      :paths="['M25,25V50']"
      :colors="downLiquids"
      stroke-linecap="round"
    />
    <LiquidStroke
      :paths="['M0,25H25']"
      :colors="leftLiquids"
      stroke-linecap="round"
    />
    <LiquidStroke
      :paths="['M25,25H50']"
      :colors="rightLiquids"
      stroke-linecap="round"
    />
    <g
      :transform="`rotate(${valvePosition * 90}, 25, 25)`"
      class="outline"
    >
      <g class="fill">
        <!-- top -->
        <path d="M10.5,21 a15,15 0,0,1 29,0 z" />
        <!-- bottom right -->
        <path d="M29,29 h10.5 a15,15 0,0,1 -10.5,10.5 V29" />
        <!-- bottom left -->
        <path d="M21,29 h-10.5 a15,15 0,0,0 10.5,10.5 V29" />
      </g>
    </g>
    <g class="outline">
      <path d="M0,21h10" />
      <path d="M0,29h10" />
      <path d="M50,21h-10" />
      <path d="M50,29h-10" />
      <path d="M21,50v-10" />
      <path d="M29,50v-10" />
      <path d="M21,10.5 A15,15 0,0,1 29,10.5" />
    </g>
    <AnimatedArrows
      :num-arrows="1"
      :speed="downSpeed"
      path="M25,25 V50"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="leftSpeed"
      path="M25,25 H0"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="rightSpeed"
      path="M25,25 H50"
    />
    <BuilderInteraction @interact="setPosition(valvePosition + 1)">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item
            v-close-popup
            clickable
            @click="setPosition(valvePosition + 1)"
          >
            <q-item-section>Rotate</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
