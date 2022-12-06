<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { LABEL_KEY } from '../const';
import { textTransformation } from '../utils';

export default defineComponent({
  name: 'BuilderLabelValues',
  props: {
    ...usePart.props,
    settingsKey: {
      type: String,
      default: LABEL_KEY,
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
  emits: [...usePart.emits],
  setup(props) {
    const { sizeX, sizeY } = usePart.setup(props.part);

    const { patchSettings } = usePart.setup(props.part);

    const text = computed<string>(
      () => props.part.settings[props.settingsKey] || props.unsetLabel,
    );

    const fontSize = computed<number>(() => props.part.settings.fontSize || 16);

    const labelTransform = computed<string>(() =>
      textTransformation(props.part, [sizeX.value, sizeY.value], false),
    );

    function interact(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: props.part.settings[props.settingsKey] ?? '',
          title: 'Edit label',
          label: 'text',
        },
      }).onOk((text) => patchSettings({ [props.settingsKey]: text }));
    }

    return {
      text,
      fontSize,
      labelTransform,
      interact,
    };
  },
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    class="interaction"
    @click="interact"
  >
    <rect class="interaction-background" />
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
  </svg>
</template>
