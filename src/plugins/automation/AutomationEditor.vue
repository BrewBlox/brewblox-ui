<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { clamp, spliceById } from '@/helpers/functional';

import { clear, idCopy, make } from './helpers';
import { automationStore } from './store';
import { AutomationStep, AutomationTemplate } from './types';

@Component
export default class AutomationEditor extends DialogBase {
  make = make;
  clear = clear;

  localDrawer: boolean | null = null;
  templateId: string | null = null;

  dragged: AutomationStep | null = null;
  section: 'Preconditions' | 'Actions' | 'Transitions' = 'Actions';

  mounted(): void {
    this.selectActive(null);
  }

  leaveEditor(): void {
    this.$router.back();
  }

  selectActive(id: string | null, stepId: string | null = null): void {
    if (id != this.$route.params.id) {
      this.$router.replace(`/automation/${id ?? ''}`);
    }
    this.templateId = id
      ?? this.$route.params.id
      ?? automationStore.activeTemplate
      ?? automationStore.templateIds[0]
      ?? null;
    automationStore.setActive(
      this.templateId
        ? [this.templateId, this.templateId === id ? stepId : null]
        : null);
  }

  get drawerOpen(): boolean {
    return Boolean(
      this.localDrawer
      ?? this.$q.localStorage.getItem('drawer')
      ?? !this.$dense);
  }

  set drawerOpen(v: boolean) {
    this.localDrawer = v;
    this.$q.localStorage.set('drawer', v);
  }

  get templates(): AutomationTemplate[] {
    return automationStore.templates;
  }

  get template(): AutomationTemplate | null {
    return automationStore.templateById(this.templateId);
  }

  get stepId(): string | null {
    return automationStore.activeStep
      ?? this.template?.steps[0]?.id
      ?? null;
  }

  get steps(): AutomationStep[] {
    return this.template?.steps ?? [];
  }

  get step(): AutomationStep | null {
    return this.template?.steps.find(s => s.id === this.stepId) ?? null;
  }

  saveTemplate(template: AutomationTemplate | null = this.template): void {
    if (template) {
      automationStore.saveTemplate(template);
    }
  }

  saveSteps(steps: AutomationStep[]): void {
    if (this.template !== null) {
      this.template.steps = steps;
      this.saveTemplate();
    }
  }

  saveStep(step: AutomationStep | null = this.step): void {
    if (this.template !== null && step !== null) {
      spliceById(this.template.steps, step);
      this.saveTemplate();
    }
  }

  startAddTemplate(copy: boolean): void {
    createDialog({
      title: 'New template',
      message: 'Choose a name for your new template',
      cancel: true,
      prompt: {
        model: copy ? (this.template?.title ?? 'New Template') : 'New Template',
        type: 'text',
      },
    }).onOk(async title => {
      const id = uid();
      const template: AutomationTemplate = copy && this.template
        ? {
          id,
          title,
          steps: this.template.steps.map(step => ({
            id: uid(),
            title: step.id,
            preconditions: step.preconditions.map(idCopy),
            actions: step.actions.map(idCopy),
            transitions: step.transitions.map(t => ({
              ...t,
              id: uid(),
              conditions: t.conditions.map(idCopy),
            })),
          })),
        }
        : {
          id,
          title,
          steps: [{
            id: uid(),
            title: 'Step one',
            preconditions: [],
            actions: [],
            transitions: [],
          }],
        };
      await automationStore.createTemplate(template);
      this;
    });
  }

  startRenameTemplate(): void {
    if (this.template === null) {
      return;
    }
    createDialog({
      title: 'Rename template',
      message: `Choose a new name for '${this.template.title}'`,
      cancel: true,
      prompt: {
        model: this.template.title,
        type: 'text',
      },
    }).onOk(title => this.template !== null && this.saveTemplate({ ...this.template, title }));
  }

  startRemoveTemplate(): void {
    if (this.template === null) {
      return;
    }
    createDialog({
      title: 'Remove template',
      message: `Are you sure you want to remove '${this.template.title}'`,
      cancel: true,
    }).onOk(() => this.template !== null && automationStore.removeTemplate(this.template));
  }

  startAddStep(): void {
    if (this.template === null) {
      return;
    }
    const step: AutomationStep = {
      id: uid(),
      title: 'New step',
      preconditions: [],
      actions: [],
      transitions: [],
    };
    this.saveSteps([...this.steps, step]);
  }

  startRenameStep(step: AutomationStep): void {
    createDialog({
      title: 'Rename step',
      message: `Choose a new name for '${step.title}'`,
      cancel: true,
      prompt: {
        model: step.title,
        type: 'text',
      },
    }).onOk(title => {
      step.title = title;
      this.saveStep(step);
    });
  }

  startRemoveStep(step: AutomationStep): void {
    createDialog({
      title: 'Remove step',
      message: `Are you sure you want to remove '${step.title}'`,
      cancel: true,
    }).onOk(() => this.saveSteps(this.steps.filter(s => s.id !== step.id)));
  }

  moveStep(step: AutomationStep, offset: number): void {
    const idx = this.steps.findIndex(v => v.id === step.id);
    const newIdx = clamp(idx + offset, 0, this.steps.length - 1);
    if (idx !== -1 && idx !== newIdx) {
      const updated = [...this.steps];
      updated.splice(idx, 1);
      updated.splice(newIdx, 0, step);
      this.saveSteps(updated);
    }
  }
}
</script>

<template>
  <q-layout
    view="hHh Lpr fFf"
  >
    <LayoutHeader @menu="drawerOpen = !drawerOpen">
      <template #title>
        Automation
      </template>
      <template #buttons>
        <q-btn
          flat
          round
          icon="mdi-close-circle"
          size="md"
          class="close-button"
          @click="leaveEditor"
        />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" content-class="column" elevated>
      <SidebarNavigator active-section="automation" />

      <div class="row">
        <q-btn-dropdown
          :label="template ? ($dense ? '' : template.title) : 'None'"
          flat
          no-caps
          class="col"
          align="between"
        >
          <q-list bordered>
            <ActionItem
              v-for="tmpl in templates"
              :key="tmpl.id"
              :label="tmpl.title"
              :active="template && tmpl.id === template.id"
              icon="mdi-view-dashboard-outline"
              @click="selectActive(tmpl.id)"
            />
          </q-list>
        </q-btn-dropdown>
        <ActionMenu class="col-auto">
          <template #actions>
            <ActionItem label="New Template" icon="add" @click="startAddTemplate(false)" />
            <ActionItem v-if="template !== null" icon="add" label="New Step" />
            <ActionItem label="Make" icon="add" @click="make" />
            <ActionItem label="Clear" icon="clear" @click="clear" />
            <template v-if="template !== null">
              <ActionItem icon="file_copy" label="Copy Template" @click="startAddLayout(true)" />
              <ActionItem icon="edit" label="Rename Template" @click="startRenameTemplate" />
              <ActionItem icon="delete" label="Remove Template" @click="startRemoveTemplate" />
            </template>
          </template>
        </ActionMenu>
      </div>
      <div class="col-auto">
        <q-separator />
      </div>

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <q-item class="q-pb-none">
          <q-item-section class="text-bold">
            Steps
          </q-item-section>
        </q-item>
        <draggable
          :value="steps"
          @input="saveSteps"
          @start="evt => dragged=steps[evt.oldIndex]"
          @end="dragged=null"
        >
          <ActionItem
            v-for="step in steps"
            :key="step.id"
            :active="(dragged && dragged.id === step.id) || stepId === step.id"
            :clickable="!dragged"
            :label="step.title"
            :inset-level="0.2"
            class="ellipsis q-pa-none"
            style="min-height: 0"
            @click="selectActive(template.id, step.id)"
          >
            <q-item-section class="col-auto" @click.stop="() => {}">
              <ActionMenu>
                <template #actions>
                  <ActionItem label="Move up" icon="mdi-chevron-up" @click="moveStep(step, -1)" />
                  <ActionItem label="Move down" icon="mdi-chevron-down" @click="moveStep(step, 1)" />
                  <ActionItem label="Rename" icon="edit" @click="startRenameStep(step)" />
                  <ActionItem label="Remove" icon="delete" @click="startRemoveStep(step)" />
                </template>
              </ActionMenu>
            </q-item-section>
          </ActionItem>
        </draggable>
        <div class="row q-pa-md justify-end">
          <q-btn
            flat
            round
            dense
            icon="add"
            color="secondary"
            @click="startAddStep"
          >
            <q-tooltip>New step</q-tooltip>
          </q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <div v-if="step" class="page-height column no-wrap q-pa-md q-gutter-md">
          <q-tabs v-model="section" :breakpoint="0">
            <q-tab name="Preconditions" label="Preconditions" />
            <q-tab name="Actions" label="Actions" />
            <q-tab name="Transitions" label="Transitions" />
          </q-tabs>
          <q-scroll-area visible class="col">
            <div class="row section-parent q-pl-lg justify-center">
              <AutomationPreconditions
                v-if="section === 'Preconditions'"
                :template="template"
                :step="step"
                @update:step="saveStep"
              />
              <AutomationActions
                v-if="section === 'Actions'"
                :template="template"
                :step="step"
                @update:step="saveStep"
              />
              <AutomationTransitions
                v-if="section === 'Transitions'"
                :template="template"
                :step="step"
                @update:step="saveStep"
              />
            </div>
          </q-scroll-area>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
.section-parent > div
  width: 600px
  max-width: 600px
</style>
