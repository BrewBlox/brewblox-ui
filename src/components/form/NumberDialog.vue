<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';
import { makeRuleValidator } from '@/utils/rules';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: number | null;
  decimals?: number;
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
  decimals: 2,
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
  useDialog.setup();

const local = ref<string | null>(
  fixedNumber(Number(props.modelValue), props.decimals),
);

const isValid = computed<boolean>(() =>
  makeRuleValidator(props.rules)(local.value),
);

function save(): void {
  if (!isValid.value) {
    return;
  }
  if (local.value != null) {
    onDialogOK(parseFloat(local.value));
  } else if (props.clearable) {
    onDialogOK(null);
  }
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      type: 'number',
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
        inputmode="numeric"
        pattern="[0-9\.]*"
        autofocus
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
