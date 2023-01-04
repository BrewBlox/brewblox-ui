<script lang="ts">
import { defineComponent } from 'vue';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../blueprints/Carboy';
import { usePart } from '../composables';

export default defineComponent({
  name: 'CarboyPartComponent',
  setup() {
    const { width, height, color } = usePart.setup();

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      width,
      height,
      color,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 100 200"
  >
    <rect
      :fill="color"
      y="50"
      width="100"
      height="148"
      rx="8"
      ry="8"
    />
    <g class="outline">
      <path
        d="M89.2,199
          H10.8
          c-5.4,0-9.8-4.4-9.8-9.9
          V43.9
          c0-4.4,2.9-8.3,7-9.5
          l32.6-8.8
          V2
          h18.6
          v24.6
          L92,34.4
          c4.2,1.2,7,5.1,7,9.5
          v145.2
          C99,194.6,94.6,199,89.2,199
          z"
      />
    </g>
    <BuilderInteraction
      :width="100"
      :height="200"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ColorMenuContent />
          <SizeMenuContent
            :min="{ width: 1, height: 1 }"
            :max="{ width: 5, height: 10 }"
            :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
    <SetpointValues :y="50" />
  </svg>
</template>
