<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

import { stepperStore } from '../store';
import { Process } from '../types';


@Component
export default class StepperEditor extends DialogBase {
  processId: string | null = null;

  @Prop({ type: String })
  public readonly initialProcess!: string;

  get process(): Process | null {
    return stepperStore.processes[
      this.processId
      || this.initialProcess
      || stepperStore.processIds[0]
      || ''
    ];
  }

  get processes(): Process[] {
    return stepperStore.processValues;
  }

  startAddProcess(copy: boolean): void {

  }

  importProcess(): void {

  }

  exportProcess(): void {

  }

  renameProcess(): void {

  }

  removeProcess(): void {

  }

  clearSteps(): void {

  }
}
</script>

<template>
  <q-dialog ref="dialog" maximized no-esc-dismiss @hide="onDialogHide">
    <q-card class="maximized bg-dark" dark>
      <DialogToolbar>
        <q-item-section>
          <q-item-label>Step Editor</q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-item dark>
        <q-item-section>
          <q-btn-dropdown
            :label="process ? process.title : 'None'"
            flat
            no-caps
            icon="widgets"
            class="col-auto"
          >
            <q-list dark bordered>
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
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn-dropdown flat icon="settings" class="col-auto">
            <q-list dark bordered>
              <ActionItem label="New Process" icon="add" @click="startAddProcess(false)" />
              <template v-if="!!process">
                <ActionItem label="Copy Process" icon="file_copy" @click="startAddProcess(true)" />
                <ActionItem icon="mdi-file-import" label="Import Process" @click="importProcess" />
                <ActionItem icon="edit" label="Rename Process" @click="renameProcess" />
                <ActionItem icon="mdi-file-export" label="Export Process" @click="exportProcess" />
                <ActionItem icon="delete" label="Remove all Steps" @click="clearSteps" />
                <ActionItem icon="delete" label="Delete Process" @click="removeProcess" />
              </template>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>

      <div class="col row">
        <!-- Process steps  -->
        <q-card-section class="col" dark>
          <template v-if="!!process">
            <q-item dark dense>
              <q-space />
              <q-item-section class="col-auto">
                <q-btn flat label="none" />
              </q-item-section>
              <q-item-section class="col-auto">
                <q-btn flat label="all" />
              </q-item-section>
            </q-item>
            <q-expansion-item
              v-for="(step, stepIdx) in process.steps"
              :key="`step-${stepIdx}-${step.name}-header`"
              :label="step.name"
              header-class="text-h6"
              content-inset-level="0.3"
            >
              <!-- Actions -->
              <q-item dark>
                <q-item-section class="text-h6 text-italic">
                  Actions
                </q-item-section>
                <q-item-section class="col-auto">
                  <q-btn flat round icon="add" />
                </q-item-section>
              </q-item>
              <q-item
                v-for="(action, actionIdx) in step.actions"
                :key="`step-${stepIdx}-action-${actionIdx}-${action.type}`"
                dark
                inset-level="0.3"
              >
                {{ action.type }}
              </q-item>
              <!-- Conditions -->
              <q-item dark>
                <q-item-section class="text-h6 text-italic">
                  Conditions
                </q-item-section>
                <q-item-section class="col-auto">
                  <q-btn flat round icon="add" />
                </q-item-section>
              </q-item>
              <q-item
                v-for="(cond, condIdx) in step.conditions"
                :key="`step-${stepIdx}-action-${condIdx}-${cond.type}`"
                dark
                inset-level="0.3"
              >
                {{ cond.type }}
              </q-item>
            </q-expansion-item>
          </template>
        </q-card-section>
        <!-- Element editor -->
        <q-card-section class="col">
          <q-item dark>
            <q-item-section>edit field</q-item-section>
          </q-item>
        </q-card-section>
      </div>
    </q-card>
  </q-dialog>
</template>


<style scoped>
.editor-section {
  max-height: 80vh;
  border: 1px solid gray;
}
</style>
