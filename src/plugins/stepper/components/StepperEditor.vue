<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

import { actionComponents } from '../actions';
import { conditionComponents } from '../conditions';
import { stepperStore } from '../store';
import { Process, ProcessStep, StepAction, StepCondition, StepNote } from '../types';


interface HasId { id: string };

@Component
export default class StepperEditor extends DialogBase {
  processId: string | null = null;
  stepId: string | null = null;
  splitterModel = 20;

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

  saveListProp(coll: HasId[], prop: HasId): void {
    if (this.process !== null) {
      const idx = coll.findIndex(p => p.id === prop.id);
      if (idx >= 0) {
        this.$set(coll, idx, prop);
        this.saveProcess(this.process);
      }
    }
  }

  saveAction(action: StepAction): void {
    if (this.step !== null) {
      this.saveListProp(this.step.actions, action);
    }
  }

  saveAllActions(actions: StepAction[]): void {
    if (this.process !== null && this.step !== null) {
      this.step.actions = actions;
      this.saveProcess(this.process);
    }
  }

  conditionComponent(condition: StepCondition): VueConstructor {
    return conditionComponents[condition.type];
  }

  saveCondition(condition: StepCondition): void {
    if (this.step !== null) {
      this.saveListProp(this.step.conditions, condition);
    }
  }

  saveAllConditions(conditions: StepCondition[]): void {
    if (this.process !== null && this.step !== null) {
      this.step.conditions = conditions;
      this.saveProcess(this.process);
    }
  }

  saveNote(note: StepNote): void {
    if (this.step !== null) {
      this.saveListProp(this.step.notes, note);
    }
  }

  saveAllNotes(notes: StepNote[]): void {
    if (this.process !== null && this.step !== null) {
      this.step.notes = notes;
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

  created(): void {
    if (this.process && this.process.steps.length) {
      this.stepId = this.process.steps[0].id;
    }
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

      <q-splitter v-model="splitterModel" dark class="col">
        <template #before>
          <q-card-section>
            <ProcessIndex
              v-if="!!process"
              :process="process"
              :selected.sync="stepId"
            />
          </q-card-section>
        </template>
        <template v-if="step" #after>
          <div class="column full-height">
            <split class="col row no-wrap">
              <!-- Actions -->
              <split-area>
                <StepperSectionEditor
                  :value="step.actions"
                  label="Actions"
                  @input="saveAllActions"
                >
                  <template #actions="{item}">
                    <ActionItem label="clicky" icon="add" />
                  </template>
                  <template #item="{item}">
                    <component
                      :is="actionComponent(item)"
                      :action="item"
                      class="col"
                      @update:action="saveAction"
                    />
                  </template>
                </StepperSectionEditor>
              </split-area>

              <!-- Conditions -->
              <split-area>
                <StepperSectionEditor
                  :value="step.conditions"
                  label="Conditions"
                  @input="saveAllConditions"
                >
                  <template #actions="{item}">
                    <ActionItem label="clicky" icon="add" />
                  </template>
                  <template #item="{item}">
                    <component
                      :is="conditionComponent(item)"
                      :condition="item"
                      class="col"
                      @update:condition="saveCondition"
                    />
                  </template>
                </StepperSectionEditor>
              </split-area>

              <!-- Notes -->
              <split-area>
                <StepperSectionEditor
                  :value="step.notes"
                  label="Notes"
                  @input="saveAllNotes"
                >
                  <template #actions="{item}">
                    <ActionItem label="clicky" icon="add" />
                  </template>
                  <template #item="{item}">
                    {{ item.title }}
                  </template>
                </StepperSectionEditor>
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
