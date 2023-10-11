<script setup lang="ts">
import { useDialog } from '@/composables';
import { PropType, ref } from 'vue';

const props = defineProps({
  ...useDialog.props,
  modelValue: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: '',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  quickActions: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
});

defineEmits({ ...useDialog.emitsObject });

const { dialogProps, dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
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
    v-bind="dialogProps"
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
