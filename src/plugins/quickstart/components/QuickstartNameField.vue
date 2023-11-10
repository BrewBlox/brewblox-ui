<script setup lang="ts">
import { computed } from 'vue';
import { createDialog } from '@/utils/dialog';

interface Props {
  modelValue: string;
  optional?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  optional: false,
});

const emit = defineEmits<{
  'update:modelValue': [payload: string];
  clear: [];
}>();

const local = computed<string>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
    },
  }).onOk((v) => (local.value = v));
}
</script>

<template>
  <q-item dense>
    <q-input
      v-model="local"
      v-bind="$attrs"
      autocomplete="off"
      reactive-rules
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
        <q-icon
          v-if="!!$slots.help"
          name="mdi-information"
          size="20px"
        >
          <q-tooltip>
            <slot name="help" />
          </q-tooltip>
        </q-icon>
      </template>
    </q-input>
  </q-item>
</template>
