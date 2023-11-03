<script setup lang="ts">
import { useHistoryStore } from '../store';
import { LoggedSession } from '../types';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import { parseDate } from '@/utils/quantity';
import cloneDeep from 'lodash/cloneDeep';
import { computed, ref } from 'vue';

interface Props extends UseDialogProps {
  modelValue: LoggedSession;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const historyStore = useHistoryStore();
const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup();

const local = ref<LoggedSession>(cloneDeep(props.modelValue));

const tags = computed<string[]>({
  get: () => local.value.tags ?? [],
  set: (v) => (local.value.tags = v),
});

const date = computed<Date | null>({
  get: () => parseDate(local.value.date),
  set: (v) =>
    (local.value.date = v ? v.toISOString() : new Date().toISOString()),
});

function save(): void {
  onDialogOK(local.value);
}

const knownTags = computed<string[]>(() => historyStore.sessionTags);
</script>

<template>
  <q-dialog
    ref="dialogRef"
    v-bind="dialogOpts"
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
        v-model="tags"
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
