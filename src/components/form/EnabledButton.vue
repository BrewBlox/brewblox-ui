<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'EnabledButton',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup(props, { emit }) {
    const icon = computed<string>(
      () => props.modelValue
        ? 'mdi-checkbox-marked-outline'
        : 'mdi-checkbox-blank-outline',
    );

    function save(val: boolean): void {
      emit('update:modelValue', val);
    }

    return {
      icon,
      save,
    };
  },
});
</script>

<template>
  <q-btn
    flat
    :icon="icon"
    v-bind="$attrs"
    @click="save(!modelValue)"
  >
    <q-tooltip>
      Toggle enabled
    </q-tooltip>
  </q-btn>
</template>
