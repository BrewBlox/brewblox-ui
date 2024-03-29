<script setup lang="ts">
import { Quantity } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';
import {
  useValEdit,
  UseValEditEmits,
  UseValEditProps,
} from '@/plugins/spark/composables';
import { createDialog } from '@/utils/dialog';
import { isQuantity } from '@/utils/identity';
import { bloxQty, durationMs, durationString } from '@/utils/quantity';

type VT = Quantity | string;

withDefaults(defineProps<UseValEditProps<VT>>(), {
  ...useValEdit.defaultProps<VT>(),
});

defineEmits<UseValEditEmits<VT>>();

const { field, startEdit } = useValEdit.setup<VT>();
const local = ref<string>(durationString(field.value));

function findUnit(s: string | null): string {
  if (!s) {
    return '';
  }
  const match = s.match(/^[0-9\.]*([a-z]*)/i);
  return match && match[1] ? match[1] : '';
}

const fallbackUnit = computed<string>(() =>
  findUnit(local.value) ? '' : findUnit(durationString(field.value)),
);

const localMs = computed<number>(() =>
  local.value ? durationMs(`${local.value}${fallbackUnit.value}`) : 0,
);

const displayValue = computed<string>(() => durationString(field.value));

function saveNormalized(): void {
  local.value = durationString(localMs.value);
  field.value = isQuantity(field.value)
    ? bloxQty(localMs.value, 'ms')
    : local.value;
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      type: 'duration',
    },
  }).onOk((v) => {
    local.value = v;
    saveNormalized();
  });
}
</script>

<template>
  <div
    v-if="editable"
    class="row no-wrap q-gutter-x-xs"
  >
    <q-input
      v-model="local"
      label="Duration"
      :suffix="fallbackUnit"
      autofocus
      item-aligned
      clearable
      class="col-grow"
      @change="saveNormalized"
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
