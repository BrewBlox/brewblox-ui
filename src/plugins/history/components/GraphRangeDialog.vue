<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { createDialog } from '@/utils/dialog';

type Range = [min: number | null, max: number | null];

interface Props extends UseDialogProps {
  value?: Range;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
  value: () => [null, null],
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogCancel, onDialogOK } =
  useDialog.setup<Range | null>();

const minV = ref(props.value[0] ?? -10);
const maxV = ref(props.value[1] ?? 20);

const minVRules = computed<InputRule[]>(() => [
  (v) => Number(v) < maxV.value || 'Lower bound must be less than upper bound',
]);

const maxVRules = computed<InputRule[]>(() => [
  (v) => Number(v) > maxV.value || 'Upper bound must be more than lower bound',
]);

const valuesOk = computed<boolean>(() => minV.value < maxV.value);

function showMinVKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: minV.value,
      rules: minVRules.value,
      type: 'number',
    },
  }).onOk((v) => (minV.value = v));
}

function showMaxVKeyboard(): void {
  createDialog({
    component: 'KeyboardDialog',
    componentProps: {
      modelValue: maxV.value,
      rules: maxVRules.value,
      type: 'number',
    },
  }).onOk((v) => (maxV.value = v));
}

function save(): void {
  if (valuesOk.value) {
    onDialogOK([minV.value, maxV.value]);
  }
}

function clear(): void {
  onDialogOK(null);
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
      <div class="row q-gutter-sm">
        <q-input
          v-model.number="minV"
          label="Lower bound"
          inputmode="numeric"
          pattern="[0-9\.]*"
          autofocus
          class="col"
          :rules="minVRules"
        >
          <template #append>
            <KeyboardButton @click="showMinVKeyboard" />
          </template>
        </q-input>
        <q-input
          v-model.number="maxV"
          label="Upper bound"
          inputmode="numeric"
          pattern="[0-9\.]*"
          class="col"
          :rules="maxVRules"
        >
          <template #append>
            <KeyboardButton @click="showMaxVKeyboard" />
          </template>
        </q-input>
      </div>
      <template #actions>
        <q-btn
          flat
          label="Auto"
          color="primary"
          @click="clear"
        />
        <q-space />
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!valuesOk"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
