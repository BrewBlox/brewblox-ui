<script setup lang="ts">
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/FilterBottom';
import { usePart } from '../composables';
import { flowOnCoord, liquidOnCoord } from '../utils';
import { LEFT } from '@/plugins/builder/const';
import { computed } from 'vue';

const paths = {
  borders: ['M29,40V30a9,9,0,0,0-9-9H1', 'M21,40V32a3,3,0,0,0-3-3H1'],
  liquid: ['M0,25H20a5,5,0,0,1,5,5V40'],
};

const { part, flows, width, height } = usePart.setup();

const flowSpeed = computed<number>(
  () => -flowOnCoord(part.value, flows.value, LEFT),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, LEFT),
);
</script>

<template>
  <!-- No viewBox. path auto-adjusts to width -->
  <svg v-bind="{ width, height }">
    <LiquidStroke
      :paths="paths.liquid"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      :path="paths.liquid[0]"
    />
    <g class="outline fill">
      <rect
        x="1"
        y="12"
        width="8"
        height="8"
      />
      <rect
        x="1"
        y="30"
        width="8"
        height="8"
      />
    </g>
    <g class="outline">
      <line
        :x2="width - 4"
        x1="2"
        y1="11"
        m
        y2="11"
        stroke-width="4px"
        stroke-dasharray="10,6"
      />
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
