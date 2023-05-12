<script setup lang="ts">
import { computed } from 'vue';
import {
  DEFAULT_SIZE,
  MAX_SIZE,
  MIN_SIZE,
  WEBFRAME_SCALE_KEY,
} from '../blueprints/WebframeDisplay';
import { usePart } from '../composables';
import { URL_KEY } from '../const';

const { settings, width, height, editable, placeholder } = usePart.setup();

const url = computed<string>(() => {
  if (placeholder) {
    return 'https://xkcd.com';
  }
  return settings.value[URL_KEY] || '';
});

const scale = computed<number>(() => {
  if (placeholder) {
    return 0.6;
  }
  return Number(settings.value[WEBFRAME_SCALE_KEY] || 100) / 100;
});

const counterScale = computed<number>(
  () => (1 - scale.value) / scale.value + 1,
);
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject v-bind="{ width, height }">
      <div
        v-if="editable || !url"
        class="fit column text-grey justify-center items-center q-gutter-y-md"
      >
        <q-icon
          name="mdi-image-frame"
          size="xl"
        />
        <div class="col-auto text-center">
          {{ url || 'No iframe URL set' }}
        </div>
      </div>
      <iframe
        v-else
        :src="url"
        referrerpolicy="no-referrer"
        allowfullscreen
        :style="{
          border: 'none',
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          width: 100 * counterScale + '%',
          height: 100 * counterScale + '%',
          'pointer-events': 'auto',
        }"
      />
    </foreignObject>
    <BuilderInteraction
      v-if="editable"
      v-bind="{ width, height }"
    >
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
          <TextMenuContent
            :settings-key="URL_KEY"
            label="Edit URL"
            message="URL must include the http:// or https:// prefix."
          />
          <SliderMenuContent
            :min="10"
            :max="300"
            :default="100"
            :settings-key="WEBFRAME_SCALE_KEY"
            label="Adjust zoom"
            postfix="%"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
