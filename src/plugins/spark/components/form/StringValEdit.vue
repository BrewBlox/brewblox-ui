<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'StringValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [...useValEdit.emits],
  setup() {
    const { field, startEdit } = useValEdit.setup<string>();

    const displayValue = computed<string>(() => field.value || '<not set>');

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: field.value,
        },
      }).onOk((v) => (field.value = v));
    }

    return {
      field,
      startEdit,
      displayValue,
      showKeyboard,
    };
  },
});
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
