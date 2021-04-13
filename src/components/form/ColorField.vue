<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useField } from '@/composables';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'ColorField',
  props: {
    ...useField.props,
    modelValue: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    nullText: {
      type: String,
      default: '<not set>',
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const { activeSlots } = useField.setup();

    const color = computed<string>(
      () => {
        const c = props.modelValue || '#ffffff';
        return c.startsWith('#') ? c : `#${c}`;
      },
    );

    const colorDesc = computed<string>(
      () => !!props.modelValue
        ? color.value
        : props.nullText,
    );

    const colorStyle = computed<Mapped<string | null>>(
      () => ({
        color: color.value,
        backgroundColor: props.modelValue ? color.value : null,
        border: `1px ${props.modelValue ? 'solid' : 'dashed'} ${color.value}`,
        borderRadius: '50%',
        height: '20px',
        width: '20px',
        display: 'inline-block',
      }),
    );

    function change(c: string | null): void {
      emit('update:modelValue', c?.replace('#', '') ?? null);
    }

    function openDialog(): void {
      if (props.readonly) {
        return;
      }

      createDialog({
        component: 'ColorDialog',
        componentProps: {
          modelValue: color.value,
          title: props.title,
          message: props.message,
          html: props.html,
          clearable: props.clearable,
        },
      })
        .onOk(change);
    }

    return {
      activeSlots,
      color,
      colorDesc,
      colorStyle,
      openDialog,
    };
  },
});
</script>

<template>
  <LabeledField v-bind="{...$attrs, ...$props}" @click="openDialog">
    <slot name="value">
      {{ colorDesc }}
    </slot>
    <template #after>
      <slot name="indicator">
        <span class="self-end q-mb-sm" :style="colorStyle" />
      </slot>
    </template>
    <template v-for="slot in activeSlots" #[slot] :name="slot" />
  </LabeledField>
</template>
