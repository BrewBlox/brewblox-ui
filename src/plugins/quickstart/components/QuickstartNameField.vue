<script lang="ts">

import { computed, defineComponent } from 'vue';

import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'QuickstartNameField',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    optional: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
    'clear',
  ],
  setup(props, { emit }) {

    const local = computed<string>({
      get: () => props.modelValue,
      set: v => emit('update:modelValue', v),
    });

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
        },
      })
        .onOk(v => local.value = v);
    }

    return {
      local,
      showKeyboard,
    };
  },
});
</script>

<template>
  <q-item dense>
    <q-input
      v-model="local"
      v-bind="$attrs"
      :error="!optional && !local"
      dense
    >
      <template #append>
        <q-btn
          icon="mdi-backup-restore"
          flat
          round
          size="sm"
          color="white"
          @click="$emit('clear')"
        >
          <q-tooltip>Reset to default</q-tooltip>
        </q-btn>
        <KeyboardButton @click="showKeyboard" />
        <q-icon v-if="!!$slots.help" name="mdi-information" size="20px">
          <q-tooltip>
            <slot name="help" />
          </q-tooltip>
        </q-icon>
      </template>
    </q-input>
  </q-item>
</template>
