<script setup lang="ts">
import {
  LABEL_FONT_SIZE_DEFAULT,
  LABEL_FONT_SIZE_KEY,
} from '../blueprints/BuilderLabel';
import { usePart } from '../composables';
import { LABEL_KEY } from '../const';
import { textTransformation } from '../utils';
import { computed } from 'vue';

interface Props {
  width: number;
  height: number;
  settingsKey?: string;
  unsetLabel?: string;
  x?: number;
  y?: number;
}

const props = withDefaults(defineProps<Props>(), {
  settingsKey: LABEL_KEY,
  unsetLabel: '',
  x: 0,
  y: 0,
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
