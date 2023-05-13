<script setup lang="ts">
import {
  DEFAULT_IO_PRESSURE,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  RIGHT,
} from '@/plugins/builder/const';
import {
  flowOnCoord,
  horizontalChevrons,
  liquidOnCoord,
} from '@/plugins/builder/utils';
import { computed } from 'vue';
import { usePart } from '../composables';

const chevrons = horizontalChevrons(15, 25);

const { part, flows, settings, patchSettings, width, height } = usePart.setup();

const pressured = computed<boolean>({
  get: () => Boolean(settings.value[IO_ENABLED_KEY]),
  set: (v) => patchSettings({ [IO_ENABLED_KEY]: Boolean(v) }),
});

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
    <LiquidStroke
      :paths="['M30,25 H50']"
      :colors="liquids"
    />
    <AnimatedArrows
      :num-arrows="1"
      :speed="flowSpeed"
      path="M25,25 H50"
    />
    <g class="outline">
      <path
        v-if="flowSpeed > 0"
        :d="chevrons.right"
      />
      <path
        v-else-if="flowSpeed < 0"
        :d="chevrons.left"
      />
      <path
        v-else
        :d="chevrons.straight"
      />
      <path d="M30,21 H50" />
      <path d="M30,29 H50" />
    </g>
    <BuilderInteraction @interact="pressured = !pressured">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ToggleMenuContent
            v-model="pressured"
            label="Active"
          />
          <ColorMenuContent />
          <PressureMenuContent
            :settings-key="IO_PRESSURE_KEY"
            :min="MIN_IO_PRESSURE"
            :max="MAX_IO_PRESSURE"
            :default="DEFAULT_IO_PRESSURE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
