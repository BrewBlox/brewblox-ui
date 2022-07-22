<script lang="ts">
import { PropType, computed, defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';
import { deepCopy } from '@/utils/objects';
import { parseDate } from '@/utils/quantity';

import { useHistoryStore } from '../store';
import { LoggedSession } from '../types';

export default defineComponent({
  name: 'SessionHeaderDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<LoggedSession>,
      required: true,
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const historyStore = useHistoryStore();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const local = ref<LoggedSession>(deepCopy(props.modelValue));

    const date = computed<Date | null>({
      get: () => parseDate(local.value.date),
      set: (v) =>
        (local.value.date = v ? v.toISOString() : new Date().toISOString()),
    });

    function save(): void {
      onDialogOK(local.value);
    }

    const knownTags = computed<string[]>(() => historyStore.sessionTags);

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      date,
      save,
      knownTags,
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
    <DialogCard :title="title">
      <InputField
        v-model="local.title"
        title="Session name"
        label="Session name"
        dense
        item-aligned
      />
      <DatetimeField
        v-model="date"
        label="Session date"
        title="Session date"
        default-now
        dense
        item-aligned
      />
      <TagSelectField
        v-model="local.tags"
        :existing="knownTags"
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
