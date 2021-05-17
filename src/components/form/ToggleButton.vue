<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'ToggleButton',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    colored: {
      type: Boolean,
      default: true,
    },
    iconEnabled: {
      type: String,
      default: 'mdi-checkbox-marked-outline',
    },
    iconDisabled: {
      type: String,
      default: 'mdi-checkbox-blank-outline',
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props) {
    const icon = computed<string>(
      () => props.modelValue
        ? props.iconEnabled
        : props.iconDisabled,
    );

    const color = computed<string>(
      () => {
        if (!props.colored) {
          return '';
        }
        return props.modelValue
          ? 'primary'
          : 'smoke';
      },
    );

    return {
      icon,
      color,
    };
  },
});
</script>

<template>
  <q-btn
    :icon="icon"
    :color="color"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <slot />
  </q-btn>
</template>
