<script setup lang="ts">
import { computed } from 'vue';
import {
  LABEL_FONT_SIZE_DEFAULT,
  LABEL_FONT_SIZE_KEY,
} from '../blueprints/BuilderLabel';
import { usePart } from '../composables';
import { LABEL_KEY } from '../const';
import { textTransformation } from '../utils';

const props = defineProps({
  settingsKey: {
    type: String,
    default: LABEL_KEY,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  unsetLabel: {
    type: String,
    default: '',
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
});

const { part, settings } = usePart.setup();

const text = computed<string>(
  () => settings.value[props.settingsKey] || props.unsetLabel,
);

const fontSize = computed<number>(
  () => settings.value[LABEL_FONT_SIZE_KEY] || LABEL_FONT_SIZE_DEFAULT,
);

const labelTransform = computed<string>(() =>
  textTransformation(part.value, part.value, false),
);
</script>

<template>
  <foreignObject
    v-bind="{ width, height }"
    :transform="labelTransform"
  >
    <div
      class="fit builder-text"
      :style="`font-size: ${fontSize}pt; padding-top: 15px`"
    >
      {{ text }}
    </div>
  </foreignObject>
</template>
