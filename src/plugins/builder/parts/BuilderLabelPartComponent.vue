<script setup lang="ts">
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/BuilderLabel';
import { usePart } from '../composables';
import { LABEL_KEY } from '../const';

const { width, height } = usePart.setup();
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
          <TextMenuContent
            :settings-key="LABEL_KEY"
            label="Edit text"
          />
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
