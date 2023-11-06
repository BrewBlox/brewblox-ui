<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { bloxQty, prettyUnit } from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import round from 'lodash/round';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: Quantity;
  decimals?: number;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  decimals: 2,
  label: 'Value',
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<Quantity>();

const local = ref<number | null>(
  props.modelValue.value !== null
    ? round(props.modelValue.value, props.decimals)
    : null,
);

function save(): void {
  onDialogOK(bloxQty(props.modelValue).copy(local.value));
}

const notation = computed<string>(() => prettyUnit(props.modelValue));

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      type: 'number',
      suffix: notation.value,
    },
  }).onOk((v) => (local.value = v));
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-input
        v-model.number="local"
        :label="label"
        :suffix="notation"
        input-class="text-big"
        inputmode="numeric"
        pattern="[0-9\.]*"
        autofocus
        item-aligned
      >
        <template #append>
          <KeyboardButton @click="showKeyboard" />
        </template>
      </q-input>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
