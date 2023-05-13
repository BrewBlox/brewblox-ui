<script setup lang="ts">
import {
  DEFAULT_PUMP_PRESSURE,
  IO_PRESSURE_KEY,
  MAX_PUMP_PRESSURE,
  MIN_PUMP_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import { computed } from 'vue';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';

const { part, flows, width, height } = usePart.setup();

const flowSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, RIGHT),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, RIGHT),
);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 50"
  >
    <g class="outline">
      <path d="M 0,21 H 50" />
      <path d="M 0,29 H 50" />
      <!-- Arrow -->
      <polyline points="20.5,10 16.5,6 20.5,2 " />
      <line
        x1="32.5"
        y1="6"
        x2="16.5"
        y2="6"
      />
      <line
        x1="0"
        y1="21"
        x2="11"
        y2="21"
      />
      <line
        x1="0"
        y1="29"
        x2="9"
        y2="29"
      />
    </g>
    <LiquidStroke
      :paths="['M 0,25 H 50']"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      path="M0,25H50"
    />
    <BuilderInteraction>
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <PressureMenuContent
            :settings-key="IO_PRESSURE_KEY"
            :min="MIN_PUMP_PRESSURE"
            :max="MAX_PUMP_PRESSURE"
            :default="DEFAULT_PUMP_PRESSURE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
