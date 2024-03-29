<script setup lang="ts">
import { ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';

interface Props extends UseDialogProps {
  modelValue: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<{ text: string; remove: boolean }>();
const local = ref<string>(props.modelValue);

function save(): void {
  onDialogOK({ text: local.value, remove: false });
}

function remove(): void {
  onDialogOK({ text: local.value, remove: true });
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
    },
  }).onOk((v: string) => (local.value = v));
}
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
    @hide="onDialogHide"
    @keyup.ctrl.enter="save"
  >
    <DialogCard v-bind="{ title, message, html }">
      <q-input
        v-model="local"
        label="Title"
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
          label="Remove"
          color="primary"
          @click="remove"
        />
        <q-space />
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
