<script lang="ts">
import { colorString } from '@/plugins/builder/utils';
import { computed, defineComponent } from 'vue';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../blueprints/Keg';
import { usePart } from '../composables';
import { COLOR_KEY } from '../const';

export default defineComponent({
  name: 'KegPartComponent',
  setup() {
    const { settings, width, height } = usePart.setup();

    const fillColor = computed<string>(() =>
      colorString(settings.value[COLOR_KEY]),
    );

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      width,
      height,
      fillColor,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 250"
  >
    <rect
      :fill="fillColor"
      x="10"
      y="60"
      width="80"
      height="178"
    />
    <g class="outline">
      <rect
        x="10"
        y="237"
        width="80"
        height="11"
      />
      <rect
        x="10"
        y="27"
        width="80"
        height="220"
      />
      <rect
        x="25"
        y="35"
        width="50"
        height="8"
        rx="4"
        ry="4"
      />
      <rect
        x="10"
        y="27"
        width="80"
        height="23.8"
      />
    </g>
    <BuilderInteraction
      :width="100"
      :height="250"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ColorMenuContent />
          <SizeMenuContent
            :min="{ width: 1, height: 2 }"
            :max="{ width: 8, height: 20 }"
            :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
    <SetpointValues :y="100" />
  </svg>
</template>
