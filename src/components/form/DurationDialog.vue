<script setup lang="ts">
import { Quantity } from 'brewblox-proto/ts';
import { computed, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';
import { bloxQty, durationMs, durationString } from '@/utils/quantity';
import { makeRuleValidator } from '@/utils/rules';

interface Props extends UseDialogProps {
  modelValue: Quantity;
  label?: string;
  rules?: InputRule[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  label: 'Value',
  rules: () => [],
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<Quantity>();
const local = ref<string | null>(durationString(props.modelValue));

function findUnit(s: string): string {
  const match = s.match(/^[0-9\.]*([a-z]*)/i);
  return match && match[1] ? match[1] : '';
}

const defaultUnit = computed<string>(() =>
  findUnit(local.value || '') === ''
    ? findUnit(durationString(props.modelValue))
    : '',
);

const localMs = computed<number>(() =>
  durationMs(`${local.value || 0}${defaultUnit.value}`),
);

const valueOk = computed<boolean>(() =>
  makeRuleValidator(props.rules)(localMs.value),
);

const error = computed<string | undefined>(() =>
  makeRuleValidator(props.rules, 'error')(localMs.value),
);

function normalize(): void {
  local.value = durationString(localMs.value);
}

function showKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: local.value ?? '',
      type: 'duration',
      rules: props.rules.map((f) => (s: string) => f(durationMs(s))),
    },
  }).onOk((v: string) => {
    local.value = v;
    normalize();
  });
}

function save(): void {
  if (valueOk.value) {
    onDialogOK(bloxQty(local.value || '0s'));
  }
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
        :label="label"
        :suffix="defaultUnit"
        :error="!!error"
        :error-message="error"
        placeholder="0"
        autofocus
        item-aligned
        @change="normalize"
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
          :disable="!valueOk"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
