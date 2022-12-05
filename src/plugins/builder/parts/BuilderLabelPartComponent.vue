<script lang="ts">
import { createDialog } from '@/utils/dialog';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';

export default defineComponent({
  name: 'BuilderLabelPartComponent',
  props: { ...usePart.props },
  emits: [...usePart.emits],
  setup(props) {
    const { patchSettings } = usePart.setup(props.part);

    const text = computed<string>(
      () => props.part.settings.text || '[click to edit]',
    );

    const fontSize = computed<number>(() => props.part.settings.fontSize || 16);

    function interact(): void {
      createDialog({
        component: 'InputDialog',
        componentProps: {
          modelValue: props.part.settings.text ?? '',
          title: 'Edit label',
          label: 'text',
        },
      }).onOk((text) => patchSettings({ text }));
    }

    return {
      text,
      fontSize,
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
    <foreignObject class="fit">
      <div
        class="fit text-bold q-pa-sm"
        :style="{ 'font-size': `${fontSize}pt` }"
      >
        {{ text }}
      </div>
    </foreignObject>
  </svg>
</template>
