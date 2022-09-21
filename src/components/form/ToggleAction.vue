<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'ToggleAction',
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
  emits: ['update:modelValue'],
  setup(props) {
    const icon = computed<string>(() =>
      props.modelValue ? props.iconEnabled : props.iconDisabled,
    );

    const color = computed<string>(() =>
      props.modelValue ? 'primary' : 'white',
    );

    return {
      icon,
      color,
    };
  },
});
</script>

<template>
  <ActionItem
    :icon="icon"
    :class="colored && `text-${color}`"
    @click="$emit('update:modelValue', !modelValue)"
  />
</template>
