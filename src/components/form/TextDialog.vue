<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { makeRuleValidator } from '@/utils/rules';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: string;
  label?: string;
  rules?: InputRule[];
  clearable?: boolean;
  autogrow?: boolean;
  fontSize?: string;
  suffix?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  label: '',
  rules: () => [],
  clearable: true,
  autogrow: false,
  fontSize: '170%',
  suffix: '',
  placeholder: undefined,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<string>();

const local = ref<string>(`${props.modelValue}`);

const isValid = computed<boolean>(() =>
  makeRuleValidator(props.rules)(local.value),
);

function save(): void {
  if (!isValid.value) {
    return;
  }
  onDialogOK(local.value);
}

function clear(): void {
  local.value = '';
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      type: 'text',
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
        v-bind="{
          rules,
          clearable,
          label,
          autogrow,
          suffix,
          placeholder,
        }"
        :input-style="{ fontSize }"
        autofocus
        @clear="clear"
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
          :disable="!isValid"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
