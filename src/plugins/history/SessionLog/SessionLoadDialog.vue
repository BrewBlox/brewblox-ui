<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { useHistoryStore } from '../store';
import { LoggedSession } from '../types';
import SessionSelectField from './SessionSelectField.vue';

withDefaults(defineProps<UseDialogProps>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const historyStore = useHistoryStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();

const local = ref<LoggedSession | null>(null);

const sessions = computed<LoggedSession[]>(() => historyStore.sessions);

function save(): void {
  onDialogOK(local.value);
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
      <SessionSelectField
        v-model="local"
        :sessions="sessions"
        label="Select session"
      />

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
