<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

import { actionComponents } from '../actions';
import { conditionComponents } from '../conditions';
import { stepperStore } from '../store';
import { Process, ProcessStep, StepAction, StepCondition } from '../types';


@Component
export default class StepperEditor extends DialogBase {
  processId: string | null = null;
  stepId: string | null = null;
  outerSplitter = 30;
  innerSplitter = 50;

  @Prop({ type: String })
  public readonly initialProcess!: string;

  get process(): Process | null {
    return stepperStore.processById(
      this.processId
      || this.initialProcess
      || stepperStore.processIds[0]
      || ''
    );
  }

  get processes(): Process[] {
    return stepperStore.processValues;
  }

  saveProcess(process: Process): void {
    stepperStore.saveProcess(process);
  }

  get step(): ProcessStep | null {
    return (this.process === null || this.stepId === null)
      ? null
      : this.process.steps.find(s => s.id === this.stepId) || null;
  }

  actionComponent(action: StepAction): VueConstructor {
    return actionComponents[action.type];
  }

  saveAction(idx: number, action: StepAction): void {
    if (this.process !== null && this.step !== null) {
      this.step.actions[idx] = action;
      this.saveProcess(this.process);
    }
  }

  conditionComponent(condition: StepCondition): VueConstructor {
    return conditionComponents[condition.type];
  }

  saveCondition(idx: number, condition: StepCondition): void {
    if (this.process !== null && this.step !== null) {
      this.step.conditions[idx] = condition;
      this.saveProcess(this.process);
    }
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
        Step Editor
        <q-space />

        <div class="row">
          <q-btn-dropdown
            :label="process ? process.title : 'None'"
            flat
            no-caps
            icon="widgets"
            class="col"
            size="md"
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
        </div>
        <template #buttons>
          <q-btn-dropdown flat icon="menu" class="col-auto">
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
        </template>
      </DialogToolbar>

      <q-splitter v-model="outerSplitter" dark class="col">
        <template #before>
          <q-card-section>
            <ProcessTower
              v-if="!!process"
              :process="process"
              :selected.sync="stepId"
            />
          </q-card-section>
        </template>
        <template v-if="step" #after>
          <q-item dark>
            <q-item-section class="text-h5 text-center">
              {{ step.title }}
            </q-item-section>
          </q-item>
          <q-splitter v-model="innerSplitter" dark style="border-top: 1px solid gray">
            <template #before>
              <q-card-section>
                <q-list dark>
                  <component
                    :is="actionComponent(action)"
                    v-for="(action, idx) in step.actions"
                    :key="'action-'+idx"
                    :action="action"
                    @update:action="v => saveAction(idx, v)"
                  />
                </q-list>
              </q-card-section>
            </template>
            <template #after>
              <q-card-section>
                <q-list dark>
                  <component
                    :is="conditionComponent(condition)"
                    v-for="(condition, idx) in step.conditions"
                    :key="'condition-'+idx"
                    :condition="condition"
                    @update:condition="v => saveCondition(idx, v)"
                  />
                </q-list>
              </q-card-section>
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </q-card>
  </q-dialog>
</template>
