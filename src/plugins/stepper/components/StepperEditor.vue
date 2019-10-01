<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

import { stepperStore } from '../store';
import { Process } from '../types';


@Component
export default class StepperEditor extends DialogBase {
  processId: string | null = null;
  splitterModel = 30;
  selected = 'one';

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

  get tree(): any {
    return this.processes
      .map(proc => ({
        label: proc.title,
        children: proc.steps.map(step => ({
          label: step.name,
          children: [
            {
              label: 'Actions',
              children: step.actions.map(action => ({
                label: action.type,
              })),
            },
            {
              label: 'Conditions',
              children: step.conditions.map(cond => ({
                label: cond.type,
              })),
            },
          ],
        })),
      }));
  }

  startAddProcess(copy: boolean): void {
    (copy);
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
    <q-card class="maximized bg-dark column" dark>
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

      <q-splitter v-model="splitterModel" dark class="col" style="border-top: 1px solid gray">
        <template #before>
          <div class="q-pa-md">
            <q-tree :nodes="tree" default-expand-all node-key="label" dark :selected.sync="selected" />
          </div>
        </template>
        <template #after>
          <q-tab-panels v-model="selected" class="bg-dark">
            <q-tab-panel name="one">
              one
            </q-tab-panel>
            <q-tab-panel name="two">
              two
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </q-card>
  </q-dialog>
</template>
