<script lang="ts">
import { computed, defineComponent } from 'vue';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../blueprints/HeatingElement';
import { usePart } from '../composables';

export default defineComponent({
  name: 'HeatingElementPartComponent',
  setup() {
    const { bordered, width, height } = usePart.setup();

    const path = computed<string>(() => {
      const straight = width.value - 100;
      return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
    });

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      bordered,
      width,
      height,
      path,
    };
  },
});
</script>

<template>
  <!-- No viewBox. width is auto-adjusted -->
  <svg v-bind="{ width, height }">
    <g class="outline">
      <path :d="path" />
    </g>
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <SizeMenuContent
            :min="{ width: 3, height: 1 }"
            :max="{ width: 10, height: 1 }"
            :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
          />
          <ToggleMenuContent
            v-model="bordered"
            label="Border"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
    <PwmValues>
      <BuilderBorder v-if="bordered" />
    </PwmValues>
  </svg>
</template>
