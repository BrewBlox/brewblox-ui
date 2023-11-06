<script setup lang="ts">
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { makeRuleValidator } from '@/utils/rules';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: Date;
  label?: string;
  resetIcon?: string;
  rules?: InputRule[];
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  label: 'Date and time',
  resetIcon: 'restore',
  rules: () => [],
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<Date>();
const local = ref<Date>(props.modelValue);

const valid = computed<boolean>(() =>
  makeRuleValidator(props.rules)(local.value),
);

function save(): void {
  if (valid.value) {
    onDialogOK(local.value);
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
      <DatetimeInput
        v-model="local"
        output="date"
      />
      <template #actions>
        <q-btn
          :icon="resetIcon"
          flat
          @click="local = new Date()"
        >
          <q-tooltip>Reset to current date and time</q-tooltip>
        </q-btn>
        <q-space />
        <q-btn
          flat
          color="primary"
          label="Cancel"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!valid"
          flat
          color="primary"
          label="OK"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
