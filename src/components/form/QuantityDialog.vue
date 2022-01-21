<script lang="ts">
import round from 'lodash/round';
import { computed, defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { Quantity } from '@/plugins/spark/types';
import { createDialog } from '@/utils/dialog';
import { prettyUnit } from '@/utils/formatting';
import { isQuantity } from '@/utils/identity';
import { bloxQty } from '@/utils/quantity';

export default defineComponent({
  name: 'QuantityDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<Quantity>,
      required: true,
      validator: isQuantity,
    },
    decimals: {
      type: Number,
      default: 2,
    },
    label: {
      type: String,
      default: 'Value',
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const { dialogProps, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

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

    return {
      dialogProps,
      dialogRef,
      onDialogHide,
      onDialogCancel,
      local,
      save,
      notation,
      showKeyboard,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
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
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
