<script lang="ts">
import isFinite from 'lodash/isFinite';
import { computed, defineComponent, ref } from 'vue';

import { useValEdit } from '@/plugins/spark/composables';
import { prettyQty, prettyUnit, Quantity } from '@/utils/bloxfield';
import { createDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'QuantityValEdit',
  props: {
    ...useValEdit.props,
  },
  emits: [
    ...useValEdit.emits,
  ],
  setup() {
    const { field, startEdit } = useValEdit.setup<Quantity>();
    const local = ref<number | null>(field.value.value);

    function syncField(): void {
      if (local.value === null || isFinite(local.value)) {
        field.value.value = local.value;
      }
    }

    const displayValue = computed<string>(
      () => prettyQty(field.value),
    );

    const notation = computed<string>(
      () => prettyUnit(field.value),
    );

    function showKeyboard(): void {
      createDialog({
        component: 'KeyboardDialog',
        componentProps: {
          modelValue: local.value,
          type: 'number',
          suffix: notation.value,
        },
      })
        .onOk(v => {
          local.value = v;
          syncField();
        });
    }

    return {
      field,
      startEdit,
      local,
      syncField,
      displayValue,
      notation,
      showKeyboard,
    };
  },
});
</script>

<template>
  <div v-if="editable" class="row no-wrap">
    <q-input
      v-model.number="local"
      :dense="dense"
      inputmode="numeric"
      pattern="[0-9]*"
      class="col-grow"
      label="Value"
      :suffix="notation"
      item-aligned
      @change="syncField"
    >
      <template #append>
        <KeyboardButton @click="showKeyboard" />
      </template>
    </q-input>
  </div>
  <div
    v-else
    class="clickable q-pa-sm rounded-borders"
    @click="startEdit"
  >
    {{ displayValue }}
  </div>
</template>
