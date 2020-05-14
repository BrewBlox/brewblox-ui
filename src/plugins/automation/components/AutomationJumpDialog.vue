<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { AutomationProcess, AutomationStep } from '../shared-types';
import { automationStore } from '../store';


@Component
export default class AutomationJumpDialog extends DialogBase {
  stepId: string | null = null;

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

  get localOk(): boolean {
    return this.stepId !== null;
  }

  save(): void {
    if (this.localOk) {
      this.onDialogOk(this.stepId);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div>
        {{ desc }}
      </div>
      <div
        v-for="opt in steps"
        :key="opt.id"
        :class="[
          'col clickable q-pa-sm rounded-borders text-h6',
          stepId === opt.id && 'depth-24',
        ]"
        @click="stepId !== opt ? stepId = opt.id : stepId = null"
        @dblclick="stepId = opt.id; next()"
      >
        {{ opt.title }}
      </div>
      <template #actions>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!localOk"
          flat
          label="OK"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
