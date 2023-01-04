<script lang="ts">
import { defineComponent } from 'vue';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../blueprints/BuilderLabel';
import { usePart } from '../composables';

export default defineComponent({
  name: 'BuilderLabelPartComponent',
  setup() {
    const { width, height } = usePart.setup();

    return {
      DEFAULT_SIZE_X,
      DEFAULT_SIZE_Y,
      width,
      height,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <BuilderLabelValues
      v-bind="{ width, height }"
      unset-label="[click to edit]"
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
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
