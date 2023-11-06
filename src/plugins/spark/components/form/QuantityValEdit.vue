<script setup lang="ts">
import {
  UseValEditEmits,
  UseValEditProps,
  useValEdit,
} from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { prettyQty, prettyUnit, roundedNumber } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import isFinite from 'lodash/isFinite';
import { computed, ref } from 'vue';

type VT = Quantity;

withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const { field, startEdit } = useValEdit.setup<VT>();
const local = ref<number | null>(roundedNumber(field.value.value));

function syncField(): void {
  if (local.value === null || isFinite(local.value)) {
    field.value.value = local.value;
  }
}

const displayValue = computed<string>(() => prettyQty(field.value));

const notation = computed<string>(() => prettyUnit(field.value));

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      type: 'number',
      suffix: notation.value,
    },
  }).onOk((v) => {
    local.value = v;
    syncField();
  });
}
</script>

<template>
  <div
    v-if="editable"
    class="row no-wrap"
  >
    <q-input
      v-model.number="local"
      :dense="dense"
      inputmode="numeric"
      pattern="[0-9\.]*"
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
