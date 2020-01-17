<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { automationStore } from '../store';
import { Process, ProcessStep } from '../types';

interface HasId {
  id: string;
}

@Component
export default class AutomationEditor extends DialogBase {
  processId: string | null = null;
  stepId: string | null = null;
  splitterModel = 20;

  @Prop({ type: String })
  public readonly initialProcess!: string;

  get process(): Process | null {
    return automationStore.processById(this.processId || this.initialProcess || automationStore.processIds[0] || '');
  }

  get processes(): Process[] {
    return automationStore.processValues;
  }

  saveProcess(process: Process | null = this.process): void {
    if (process) {
      automationStore.saveProcess(process);
    }
  }

  get step(): ProcessStep | null {
    return this.process === null || this.stepId === null
      ? null
      : this.process.steps.find(s => s.id === this.stepId) || null;
  }

  saveStep(step: ProcessStep | null = this.step): void {
    if (this.process !== null && step !== null) {
      spliceById(this.process.steps, step);
      this.saveProcess();
    }
  }

  startAddProcess(copy: boolean): void {
    copy;
  }

  startRenameProcess(): void {
    if (this.process === null) {
      return;
    }
    createDialog({
      parent: this,
      title: 'Rename process',
      message: `Choose a new name for '${this.process.title}'`,
      cancel: true,
      prompt: {
        model: this.process.title,
        type: 'text',
      },
    }).onOk(title => this.process !== null && this.saveProcess({ ...this.process, title }));
  }

  startRemoveProcess(): void {
    if (this.process === null) {
      return;
    }
    createDialog({
      parent: this,
      title: 'Remove process',
      message: `Are you sure you want to remove '${this.process.title}'`,
      cancel: true,
    }).onOk(() => this.process !== null && automationStore.removeProcess(this.process));
  }

  created(): void {
    if (this.process && this.process.steps.length) {
      this.stepId = this.process.steps[0].id;
    }
  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-esc-dismiss @hide="onDialogHide">
    <q-card class="maximized column">
      <DialogToolbar>
        Step Editor
        <q-space />

        <div class="row">
          <q-btn-dropdown :label="process ? process.title : 'None'" flat no-caps icon="widgets" class="col" size="md">
            <q-list bordered>
              <ActionItem
                v-for="proc in processes"
                :key="proc.id"
                :label="proc.title"
                :active="process && proc.id === process.id"
                icon="mdi-view-dashboard-outline"
                @click="processId = proc.id"
              />
            </q-list>
          </q-btn-dropdown>
        </div>
        <template #buttons>
          <q-btn-dropdown flat icon="menu" class="col-auto">
            <q-list bordered>
              <ActionItem label="New Process" icon="add" @click="startAddProcess(false)" />
              <template v-if="!!process">
                <ActionItem label="Copy Process" icon="file_copy" @click="startAddProcess(true)" />
                <!-- <ActionItem icon="mdi-file-import" label="Import Process" @click="importProcess" /> -->
                <ActionItem icon="edit" label="Rename Process" @click="startRenameProcess" />
                <!-- <ActionItem icon="mdi-file-export" label="Export Process" @click="exportProcess" /> -->
                <ActionItem icon="delete" label="Delete Process" @click="startRemoveProcess" />
              </template>
            </q-list>
          </q-btn-dropdown>
        </template>
      </DialogToolbar>

      <q-splitter v-model="splitterModel" class="col">
        <template #before>
          <q-card-section>
            <ProcessIndex v-if="!!process" :process="process" :selected.sync="stepId" />
          </q-card-section>
        </template>
        <template v-if="step" #after>
          <div class="column full-height">
            <split class="col row no-wrap">
              <split-area>
                <AutomationActionEditor :step="step" @update:step="saveStep" />
              </split-area>
              <split-area>
                <AutomationConditionEditor :step="step" @update:step="saveStep" />
              </split-area>
              <split-area>
                <AutomationNoteEditor :step="step" @update:step="saveStep" />
              </split-area>
            </split>
          </div>
        </template>
      </q-splitter>
    </q-card>
  </q-dialog>
</template>

<style>
.gutter.gutter-horizontal {
  background: whitesmoke;
  background-image: none;
}
</style>
