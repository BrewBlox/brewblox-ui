<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { automationStore } from '../store';
import { AutomationProcess, AutomationStep } from '../types';


@Component
export default class AutomationJumpDialog extends DialogBase {
  local: AutomationStep | null = null;

  @Prop({ type: String, required: true })
  public readonly processId!: string;

  @Prop({ type: String, default: 'Jump to process step' })
  public readonly title!: string;

  get process(): AutomationProcess | null {
    return automationStore.processById(this.processId);
  }

  get desc(): string {
    return this.process
      ? `This will immediately start the selected step in process '${this.process.title}'.`
      : 'Error: process not found';
  }

  get steps(): AutomationStep[] {
    return this.process?.steps ?? [];
  }

  save(step: AutomationStep | null): void {
    if (step) {
      this.onDialogOk(step.id);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save(local)"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="q-mb-md">
        {{ desc }}
      </div>
      <ListSelect
        v-model="local"
        :options="steps"
        option-value="id"
        option-label="title"
        @confirm="v => save(v)"
      />
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
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
