<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { makeRuleValidator } from '@/utils/rules';

interface Props extends UseDialogProps {
  modelValue: number | null;
  fractionDigits?: number;
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
  fractionDigits: 4,
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
  useDialog.setup<number | null>();

const local = ref<string | number>(
  props.modelValue != null
    ? Number(props.modelValue).toExponential(props.fractionDigits)
    : '',
);

function parse(v: Maybe<string | number>): number | null {
  if (v == null) {
    return null;
  }
  if (v === '') {
    return null;
  }
  return Number(v);
}

const parsed = computed<number | null>(() => parse(local.value));
const parsedDisplay = computed<string>(() => {
  const value = parse(local.value);
  return value !== null
    ? Number(value).toExponential(props.fractionDigits)
    : '<not set>';
});
const validator = computed<(val: any) => boolean>(() =>
  makeRuleValidator(props.rules),
);

const isValid = computed<boolean>(() => validator.value(parsed.value));

function save(): void {
  if (isValid.value) {
    onDialogOK(parsed.value);
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
        v-model.number="local"
        v-bind="{
          clearable,
          label,
          autogrow,
          suffix,
          placeholder,
          rules,
        }"
        :input-style="{ fontSize }"
        :hint="`${parsedDisplay}`"
        type="number"
        step="any"
        inputmode="numeric"
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
