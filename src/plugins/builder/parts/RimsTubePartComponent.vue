<script setup lang="ts">
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/RimsTube';
import { usePart } from '../composables';
import { elbow, flowOnCoord, liquidOnCoord } from '@/plugins/builder/utils';
import { Coordinates } from '@/utils/coordinates';
import { computed } from 'vue';

const { part, flows, bordered, width, height } = usePart.setup();

const paths = computed<Mapped<string>>(() => {
  const startLast = width.value - 50;
  return {
    closeLeft: 'M50,10 v30',
    entry: `M71,0 v10 M79,0 v10 M${startLast + 21},0 v10 M${
      startLast + 29
    },0 v10`,
    content: `M50,25 H${startLast + 47}`,
    casing:
      `M50,10 H71 M79,10 H${startLast + 21} M${startLast + 29},10 ` +
      `H${startLast + 50 - 4 - 2} ${elbow(4, 4, true)} V36 ${elbow(
        -4,
        4,
        false,
      )} H50 V10`,
    element: `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 H${
      startLast + 25
    } c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`,
    flowPath:
      `M75,0 v17 ${elbow(8, 8, false)}` +
      `H${startLast + 17} ${elbow(8, -8, true)} V0`,
  };
});

const outCoord = computed<string>(() =>
  new Coordinates([part.value.width - 0.5, 0, 0]).toString(),
);

const flowSpeed = computed<number>(() =>
  flowOnCoord(part.value, flows.value, outCoord.value),
);

const liquids = computed<string[]>(() =>
  liquidOnCoord(part.value, flows.value, outCoord.value),
);
</script>

<template>
  <svg v-bind="{ width, height }">
    <LiquidStroke
      :paths="[paths.content]"
      :colors="liquids"
      class="content-liquid"
      stroke-width="30"
      fill="none"
    />
    <LiquidStroke
      :paths="[paths.flowPath]"
      :colors="liquids"
    />
    <AnimatedArrows
      :num-arrows="(part.width - 1) * 2"
      :speed="flowSpeed"
      :path="paths.flowPath"
    />
    <g class="outline">
      <!-- <path :d="paths.closeLeft" /> -->
      <path :d="paths.entry" />
      <path :d="paths.casing" />
      <path :d="paths.element" />
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
    <PwmValues>
      <BuilderBorder v-if="bordered" />
      <template #menu-content>
        <ToggleMenuContent
          v-model="bordered"
          label="Border"
        />
      </template>
    </PwmValues>
  </svg>
</template>
