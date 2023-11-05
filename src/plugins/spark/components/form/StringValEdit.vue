<script setup lang="ts">
import {
  UseValEditEmits,
  UseValEditProps,
  useValEdit,
} from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { computed } from 'vue';

type VT = string;

withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const { field, startEdit } = useValEdit.setup<VT>();

const displayValue = computed<string>(() => field.value || '<not set>');

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: field.value,
    },
  }).onOk((v) => (field.value = v));
}
</script>

<template>
  <q-input
    v-if="editable"
    v-model="field"
    dense
  >
    <template #append>
      <KeyboardButton @click="showKeyboard" />
    </template>
  </q-input>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayValue }}
  </div>
</template>
