<script setup lang="ts">
import { UseDialogEmits, UseDialogProps, useDialog } from '@/composables';
import { ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  clearable?: boolean;
  quickActions?: SelectOption[];
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  label: '',
  clearable: true,
  quickActions: () => [],
});

defineEmits<UseDialogEmits>();

const { dialogOpts, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();

const local = ref<number>(props.modelValue);

function save(): void {
  onDialogOK(local.value);
}

function apply(value: number): void {
  local.value = value;
  // Allow user to see slider filling before dialog closes
  setTimeout(() => save(), 200);
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
      <q-item>
        <q-item-section class="q-pt-md">
          <q-slider
            v-model="local"
            :min="min"
            :max="max"
            label-always
          />
        </q-item-section>
      </q-item>
      <q-item v-if="quickActions.length">
        <q-item-section
          v-for="q in quickActions"
          :key="'quick' + q.value"
        >
          <q-btn
            unelevated
            :label="q.label"
            @click="apply(q.value)"
          />
        </q-item-section>
      </q-item>

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
