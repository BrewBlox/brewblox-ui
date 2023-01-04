<script lang="ts">
import { computed, defineComponent } from 'vue';
import {
  DEFAULT_SHELF_Y,
  DEFAULT_SIZE_X,
  DEFAULT_SIZE_Y,
  SHELF_Y_KEY,
} from '../blueprints/Fridge';
import { usePart } from '../composables';
import { coord2grid } from '../utils';

export default defineComponent({
  name: 'FridgePartComponent',
  setup() {
    const { settings, width, height } = usePart.setup();

    const shelfHeight = computed<number>(() =>
      coord2grid(settings.value[SHELF_Y_KEY] || DEFAULT_SHELF_Y),
    );

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      SHELF_Y_KEY,
      DEFAULT_SHELF_Y,
      width,
      height,
      shelfHeight,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <g class="outline">
      <!-- Top divider -->
      <line
        :x1="2"
        :y1="50"
        :x2="width - 4"
        :y2="50"
      />
      <!-- Bottom divider -->
      <line
        :x1="2"
        :y1="height - 50"
        :x2="width - 4"
        :y2="height - 50"
      />
      <!-- Shelf divider-->
      <line
        :x1="2"
        :y1="shelfHeight"
        :x2="width - 4"
        :y2="shelfHeight"
      />
    </g>
    <BuilderBorder
      v-bind="{ width, height }"
      large
    />
    <BuilderLabelValues
      :width="width"
      :height="50"
    />
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <TextMenuContent />
          <SizeMenuContent
            :min="{ width: 2, height: 1 }"
            :max="{ width: 10, height: 10 }"
            :default="{ width: DEFAULT_SIZE_X, height: DEFAULT_SIZE_Y }"
          />
          <SliderMenuContent
            :settings-key="SHELF_Y_KEY"
            :min="1"
            :max="14"
            :default="DEFAULT_SHELF_Y"
            label="Shelf position (from top)"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
