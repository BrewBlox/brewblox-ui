<script setup lang="ts">
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/ImageDisplay';
import { usePart } from '../composables';
import { URL_KEY } from '../const';
import { computed } from 'vue';

const { settings, width, height, passthrough } = usePart.setup();

const href = computed<string>(
  () => settings.value[URL_KEY] || '/image-placeholder.png',
);
</script>

<template>
  <svg v-bind="{ width, height }">
    <image v-bind="{ width, height, href }" />
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <TextMenuContent
            :settings-key="URL_KEY"
            label="Image URL"
          />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="passthrough"
            label="Flow through part"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
