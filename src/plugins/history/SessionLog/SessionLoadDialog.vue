<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';

import { useHistoryStore } from '../store';
import { LoggedSession } from '../types';
import SessionSelectField from './SessionSelectField.vue';

export default defineComponent({
  name: 'SessionLoadDialog',
  components: {
    SessionSelectField,
  },
  props: {
    ...useDialog.props,
  },
  emits: [...useDialog.emits],
  setup() {
    const historyStore = useHistoryStore();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const local = ref<LoggedSession | null>(null);

    const sessions = computed<LoggedSession[]>(() => historyStore.sessions);

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      sessions,
      save,
    };
  },
});
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogProps"
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
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
