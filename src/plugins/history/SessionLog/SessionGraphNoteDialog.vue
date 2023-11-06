<script setup lang="ts">
import { SessionGraphNote } from '../types';
import { useDialog, UseDialogEmits, UseDialogProps } from '@/composables';
import cloneDeep from 'lodash/cloneDeep';
import { ref } from 'vue';

type NoteDates = Pick<SessionGraphNote, 'start' | 'end'>;

interface Props extends UseDialogProps {
  modelValue: NoteDates;
}

const props = withDefaults(defineProps<Props>(), {
  ...useDialog.defaultProps,
});

defineEmits<UseDialogEmits>();

const { dialogRef, dialogOpts, onDialogHide, onDialogOK, onDialogCancel } =
  useDialog.setup<NoteDates>();

const local = ref<NoteDates>(cloneDeep(props.modelValue));

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
      <div class="q-pl-sm">
        <div class="row items-center q-ml-none">
          <span class="col-grow text-secondary text-italic text-bold">
            Graph start
          </span>
          <q-btn
            icon="restore"
            flat
            round
            @click="local.start = new Date().toISOString()"
          />
          <q-btn
            :disable="local.start == null"
            icon="clear"
            flat
            round
            @click="local.start = null"
          />
        </div>

        <DatetimeInput
          v-model="local.start"
          output="number"
        />

        <div class="row items-center q-mt-md q-ml-none">
          <span class="col-grow text-secondary text-italic text-bold">
            Graph end
          </span>
          <q-btn
            icon="restore"
            flat
            round
            @click="local.end = new Date().toISOString()"
          />
          <q-btn
            :disable="local.end == null"
            icon="clear"
            flat
            round
            @click="local.end = null"
          />
        </div>

        <DatetimeInput
          v-model="local.end"
          output="number"
        />

        <div
          v-if="local.start && local.end && local.start > local.end"
          class="q-mt-md text-negative"
        >
          Warning: graph ends before it starts.
        </div>
      </div>

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
