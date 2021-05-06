<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { useDialog } from '@/composables';
import { deepCopy } from '@/utils/functional';

import { SessionGraphNote } from '../types';

type NoteDates = Pick<SessionGraphNote, 'start' | 'end'>;

export default defineComponent({
  name: 'SessionGraphNoteDialog',
  props: {
    ...useDialog.props,
    modelValue: {
      type: Object as PropType<NoteDates>,
      required: true,
    },
  },
  emits: [
    ...useDialog.emits,
  ],
  setup(props) {
    const {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialog.setup();

    const local = ref<NoteDates>(deepCopy(props.modelValue));

    function save(): void {
      onDialogOK(local.value);
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
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
    <DialogCard v-bind="{title, message, html}">
      <div class="row q-gutter-xs q-ml-md">
        <DatetimeField
          v-model="local.start"
          :rules="[
            date => local.end === null
              || date.getTime() < local.end
              || 'Start must be before than end']"
          emit-number
          title="Start"
          label="Start"
          clear-label="Not started"
          default-now
          class="col-grow"
        />
        <q-btn
          v-if="local.start !== null"
          :disable="local.end !== null"
          icon="clear"
          flat
          class="col-auto"
          @click="local.start = null"
        />

        <div class="col-break" />

        <DatetimeField
          v-model="local.end"
          :rules="[
            date => local.start === null
              || date.getTime() > local.start
              || 'End must be after start']"
          emit-number
          title="End"
          label="End"
          :readonly="local.start === null"
          :clear-label="local.start === null ? 'Not started' : 'In progress'"
          default-now
          class="col-grow"
        />
        <q-btn
          v-if="local.end !== null"
          icon="clear"
          flat
          class="col-auto"
          @click="local.end = null"
        />
      </div>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
