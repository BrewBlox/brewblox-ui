<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { useDialog } from '@/composables';

import { useAutomationStore } from './store';
import { AutomationProcess, AutomationStep } from './types';

export default defineComponent({
  name: 'AutomationJumpDialog',
  props: {
    ...useDialog.props,
    processId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Jump to process step',
    },
  },
  emits: [...useDialog.emits],
  setup(props) {
    const automationStore = useAutomationStore();
    const { dialogRef, dialogProps, onDialogHide, onDialogOK, onDialogCancel } =
      useDialog.setup();

    const local = ref<AutomationStep | null>(null);

    const process = computed<AutomationProcess | null>(() =>
      automationStore.processById(props.processId),
    );

    const desc = computed<string>(() =>
      process.value
        ? `This will immediately start the selected step in process '${process.value.title}'.`
        : 'Error: process not found',
    );

    const steps = computed<AutomationStep[]>(() => process.value?.steps ?? []);

    function save(step: AutomationStep | null): void {
      if (step) {
        onDialogOK(step.id);
      }
    }

    return {
      dialogRef,
      dialogProps,
      onDialogHide,
      onDialogCancel,
      local,
      process,
      desc,
      steps,
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
    @keyup.enter="save(local)"
  >
    <DialogCard v-bind="{ title, message, html }">
      <div class="q-mb-md">
        {{ desc }}
      </div>
      <ListSelect
        v-model="local"
        :options="steps"
        option-value="id"
        option-label="title"
        @confirm="(v) => save(v)"
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn
          :disable="!local"
          flat
          label="OK"
          color="primary"
          @click="save(local)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
