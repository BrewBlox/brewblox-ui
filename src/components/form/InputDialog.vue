<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { fixedNumber } from '@/utils/quantity';
import { makeRuleValidator } from '@/utils/rules';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: string | number | null;
  type?: 'text' | 'number';
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
  type: 'text',
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

const local = ref<string>(
  props.type === 'number'
    ? fixedNumber(Number(props.modelValue), props.decimals)
    : `${props.modelValue ?? ''}`,
);

const isValid = computed<boolean>(() =>
  makeRuleValidator(props.rules)(local.value),
);

const nativeProps = computed<AnyDict>(() =>
  props.type === 'number'
    ? {
        inputmode: 'numeric',
        pattern: '[0-9\.]*',
      }
    : {},
);

function save(): void {
  if (!isValid.value) {
    return;
  }
  const outputValue =
    props.type === 'number' ? parseFloat(local.value) : local.value;
  onDialogOK(outputValue);
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value,
      type: props.type,
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
          ...nativeProps,
        }"
        :input-style="{ fontSize }"
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
