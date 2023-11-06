<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: string;
  autogrow?: boolean;
  rules?: InputRule[];
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  autogrow: true,
  rules: () => [],
  label: 'Value',
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<string>();

const local = ref<string>(props.modelValue ?? '');

function save(): void {
  onDialogOK(local.value);
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      rules: props.rules,
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
        v-model="local"
        type="textarea"
        :rules="rules"
        :label="label"
        :autogrow="autogrow"
        autofocus
        @keyup.enter.exact.stop
        @keyup.enter.shift.stop
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
