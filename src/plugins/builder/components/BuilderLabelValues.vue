<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import {
  LABEL_FONT_SIZE_DEFAULT,
  LABEL_FONT_SIZE_KEY,
} from '../blueprints/BuilderLabel';
import { usePart } from '../composables';
import { LABEL_KEY } from '../const';
import { textTransformation } from '../utils';

export default defineComponent({
  name: 'BuilderLabelValues',
  props: {
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
  },
  setup(props) {
    const { part, settings, sizeX, sizeY, patchSettings } = usePart.setup();

    const text = computed<string>(
      () => settings.value[props.settingsKey] || props.unsetLabel,
    );

    const fontSize = computed<number>(
      () => settings.value[LABEL_FONT_SIZE_KEY] || LABEL_FONT_SIZE_DEFAULT,
    );

    const labelTransform = computed<string>(() =>
      textTransformation(part.value, [sizeX.value, sizeY.value], false),
    );

    function edit(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: settings.value[props.settingsKey] ?? '',
          title: 'Edit label',
          label: 'text',
        },
      }).onOk((text) => patchSettings({ [props.settingsKey]: text }));
    }

    return {
      text,
      fontSize,
      labelTransform,
      edit,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject
      :transform="labelTransform"
      class="fit"
    >
      <div
        class="fit builder-text"
        :style="`font-size: ${fontSize}pt; padding-top: 15px`"
      >
        {{ text }}
      </div>
    </foreignObject>
    <BuilderInteraction
      v-bind="{ width, height }"
      @interact="edit"
    />
  </svg>
</template>
