<script lang="ts">
import {
  DEFAULT_IO_PRESSURE,
  IO_ENABLED_KEY,
  IO_PRESSURE_KEY,
  MAX_IO_PRESSURE,
  MIN_IO_PRESSURE,
  UP,
} from '@/plugins/builder/const';
import {
  flowOnCoord,
  liquidOnCoord,
  verticalChevrons,
} from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

const chevrons = verticalChevrons(50, 86.4);

export default defineComponent({
  name: 'ShiftedSystemIOPartComponent',
  setup() {
    const { part, flows, settings, patchSettings, width, height } =
      usePart.setup();

    const pressured = computed<boolean>({
      get: () => Boolean(settings.value[IO_ENABLED_KEY]),
      set: (v) => patchSettings({ [IO_ENABLED_KEY]: Boolean(v) }),
    });

    const flowSpeed = computed<number>(
      () => -flowOnCoord(part.value, flows.value, UP),
    );

    const liquids = computed<string[]>(() =>
      liquidOnCoord(part.value, flows.value, UP),
    );

    return {
      IO_PRESSURE_KEY,
      MIN_IO_PRESSURE,
      MAX_IO_PRESSURE,
      DEFAULT_IO_PRESSURE,
      width,
      height,
      pressured,
      chevrons,
      flowSpeed,
      liquids,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 100"
  >
    <LiquidStroke
      :paths="['M25,0V20a5,5,0,0,0,5,5 h14.5 a5,5,0,0,1,5,6 V75']"
      :colors="liquids"
    />
    <AnimatedArrows
      :speed="flowSpeed"
      path="M25,0V20a5,5,0,0,0,5,5 h14.5 a5,5,0,0,1,5,6 V80"
    />
    <g class="outline">
      <path d="M21,0v20c0,5,4,9,9,9 h13 c1.7,0 1.3,3 3,3 V75" />
      <path d="M29,0v18c0,1.7,1.3,3,3,3 h13 c5,0 9,4 9,9 V75" />
      <path
        v-if="flowSpeed > 0"
        :d="chevrons.down"
      />
      <path
        v-else-if="flowSpeed < 0"
        :d="chevrons.up"
      />
      <path
        v-else
        :d="chevrons.straight"
      />
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
