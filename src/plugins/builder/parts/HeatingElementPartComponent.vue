<script setup lang="ts">
import { computed } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/HeatingElement';
import { usePart } from '../composables';

const { bordered, width, height } = usePart.setup();

const path = computed<string>(() => {
  const straight = width.value - 100;
  return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
});
</script>

<template>
  <!-- No viewBox. width is auto-adjusted -->
  <svg v-bind="{ width, height }">
    <g class="outline">
      <path
        :d="path"
        stroke-width="3"
      />
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
