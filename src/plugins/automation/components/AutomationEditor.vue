<script lang="ts">
import { uid } from 'quasar';
import { VueConstructor } from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { actionComponents } from '../actions';
import { conditionComponents } from '../conditions';
import { automationStore } from '../store';
import { Process, ProcessStep, StepAction, StepCondition, StepNote } from '../types';


interface HasId { id: string };

@Component
export default class AutomationEditor extends DialogBase {
  processId: string | null = null;
  stepId: string | null = null;
  splitterModel = 20;

  @Prop({ type: String })
  public readonly initialProcess!: string;

  get process(): Process | null {
    return automationStore.processById(
      this.processId
      || this.initialProcess
      || automationStore.processIds[0]
      || ''
    );
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
    return (this.process === null || this.stepId === null)
      ? null
      : this.process.steps.find(s => s.id === this.stepId) || null;
  }

  saveStep(step: ProcessStep | null = this.step): void {
    if (this.process !== null && step !== null) {
      spliceById(this.process.steps, step);
      this.saveProcess();
    }
  }

  actionComponent(action: StepAction): VueConstructor {
    return actionComponents[action.type];
  }

  saveAction(action: StepAction): void {
    if (this.step) {
      spliceById(this.step.actions, action);
      this.saveStep();
    }
  }

  saveAllActions(actions: StepAction[]): void {
    if (this.step) {
      this.step.actions = actions;
      this.saveStep();
    }
  }

  startAddAction(): void {

  }

  conditionComponent(condition: StepCondition): VueConstructor {
    return conditionComponents[condition.type];
  }

  saveCondition(condition: StepCondition): void {
    if (this.step) {
      spliceById(this.step.conditions, condition);
      this.saveStep();
    }
  }

  saveAllConditions(conditions: StepCondition[]): void {
    if (this.step) {
      this.step.conditions = conditions;
      this.saveStep();
    }
  }

  startAddCondition(): void {

  }

  saveNote(note: StepNote): void {
    if (this.step) {
      spliceById(this.step.notes, note);
      this.saveStep();
    }
  }

  saveAllNotes(notes: StepNote[]): void {
    if (this.step) {
      this.step.notes = notes;
      this.saveStep();
    }
  }

  startAddNote(): void {
    if (this.step) {
      this.step.notes.push({
        id: uid(),
        title: 'New note',
        message: '',
      });
      this.saveStep();
    }
  }

  removeNote(note: StepNote): void {
    if (this.step) {
      spliceById(this.step.notes, note, false);
      this.saveStep();
    }
  }

  startAddProcess(copy: boolean): void {
    (copy);
  }

  startRenameProcess(): void {
    if (this.process === null) { return; }
    createDialog({
      parent: this,
      title: 'Rename process',
      message: `Choose a new name for '${this.process.title}'`,
      cancel: true,
      prompt: {
        model: this.process.title,
        type: 'text',
      },
    })
      .onOk(title =>
        this.process !== null && this.saveProcess({ ...this.process, title }));
  }

  startRemoveProcess(): void {
    if (this.process === null) { return; }
    createDialog({
      parent: this,
      title: 'Remove process',
      message: `Are you sure you want to remove '${this.process.title}'`,
      cancel: true,
    })
      .onOk(() => this.process !== null && automationStore.removeProcess(this.process));
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
    <q-card class="maximized bg-dark column">
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
                <AutomationSectionEditor
                  :value="step.actions"
                  label="Actions"
                  @input="saveAllActions"
                  @new="startAddAction"
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
                </AutomationSectionEditor>
              </split-area>
              <!-- Conditions -->
              <split-area>
                <AutomationSectionEditor
                  :value="step.conditions"
                  label="Conditions"
                  @input="saveAllConditions"
                  @new="startAddCondition"
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
                </AutomationSectionEditor>
              </split-area>
              <!-- Notes -->
              <split-area>
                <AutomationSectionEditor
                  :value="step.notes"
                  label="Notes"
                  @input="saveAllNotes"
                  @new="startAddNote"
                >
                  <template #actions="{item}">
                    <ActionItem label="clicky" icon="add" />
                    <ActionItem label="Remove note" icon="delete" @click="removeNote(item)" />
                  </template>
                  <template #item="{item}">
                    <AutomationNote :note="item" class="col" @update:note="saveNote" />
                  </template>
                </AutomationSectionEditor>
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
