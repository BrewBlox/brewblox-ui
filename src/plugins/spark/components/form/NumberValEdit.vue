<script lang="ts">
import { defineComponent, ref } from 'vue';

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
    const local = ref<number>(field.value);

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

    function syncField(): void {
      if (isFinite(local.value)) {
        field.value = local.value;
      }
    }

    return {
      local,
      startEdit,
      showKeyboard,
      syncField,
    };
  },
});
</script>

<template>
  <q-input
    v-if="editable"
    v-model.number="local"
    inputmode="numeric"
    pattern="[0-9\.]*"
    item-aligned
    dense
    @change="syncField"
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
    {{ local }}
  </div>
</template>
