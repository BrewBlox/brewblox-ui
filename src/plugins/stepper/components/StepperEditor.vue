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
  conditionEditMode = false;

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
            <q-item-section class="col-auto">
              <q-btn flat round icon="add">
                <q-tooltip>Add Action</q-tooltip>
              </q-btn>
            </q-item-section>
            <q-item-section class="text-h5 text-center">
              <span>Apply <b class="text-info">Actions</b> and then wait for <b class="text-info">Conditions</b></span>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn flat round icon="add">
                <q-tooltip>Add Condition</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
          <q-splitter v-model="innerSplitter" dark style="border-top: 1px solid gray">
            <template #before>
              <q-card-section>
                <q-list dark class="inner-container">
                  <div
                    v-for="(action, idx) in step.actions"
                    :key="'action-'+idx"
                    class="row q-mb-md"
                  >
                    <div class="col-auto column">
                      <q-btn icon="menu">
                        <q-menu>
                          <q-list dark bordered>
                            <ActionItem label="clicky" icon="add" />
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn icon="mdi-chevron-up" />
                      <q-btn icon="mdi-chevron-down" />
                    </div>
                    <component
                      :is="actionComponent(action)"
                      :action="action"
                      class="col"
                      @update:action="v => saveAction(idx, v)"
                    />
                  </div>
                </q-list>
              </q-card-section>
            </template>
            <template #after>
              <q-card-section>
                <q-list dark class="inner-container">
                  <div
                    v-for="(condition, idx) in step.conditions"
                    :key="'condition-'+idx"
                    class="row q-mb-md"
                  >
                    <div class="col-auto column">
                      <q-btn icon="menu">
                        <q-menu>
                          <q-list dark bordered>
                            <ActionItem label="clicky" icon="add" />
                          </q-list>
                        </q-menu>
                      </q-btn>
                      <q-btn icon="mdi-chevron-up" />
                      <q-btn icon="mdi-chevron-down" />
                    </div>
                    <component
                      :is="conditionComponent(condition)"
                      :condition="condition"
                      class="col"
                      @update:condition="v => saveCondition(idx, v)"
                    />
                  </div>
                </q-list>
              </q-card-section>
            </template>
          </q-splitter>
        </template>
      </q-splitter>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.inner-container > div:nth-child(odd) {
  border-left: 2px solid dodgerblue;
}
.inner-container > div:nth-child(even) {
  border-left: 2px solid red;
}
.button-bar > * {
  border-left: 1px solid silver;
}
.button-bar > *:nth-child(1) {
  border-left: none;
}
.inner-editable {
  background-color: rgba(255, 255, 255, 0.18);
}
</style>
