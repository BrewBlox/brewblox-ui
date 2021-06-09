<script lang="ts">
import { defineComponent } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'NumberValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [
    ...useValEdit.emits,
  ],
  setup(props) {
    const {
      field,
      startEdit,
    } = useValEdit.setup<number>(props.modelValue);

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: field.value,
          type: 'number',
        },
      })
        .onOk(v => field.value = v);
    }

    return {
      field,
      startEdit,
      showKeyboard,
    };
  },
});
</script>

<template>
  <q-input
    v-if="editable"
    v-model.number="field"
    inputmode="numeric"
    pattern="[0-9]*"
    item-aligned
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
    {{ field }}
  </div>
</template>
