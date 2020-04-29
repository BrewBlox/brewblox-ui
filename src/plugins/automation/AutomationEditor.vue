<script lang="ts">
import { uid } from 'quasar';
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { clamp, spliceById } from '@/helpers/functional';

import { clear, idCopy, make } from './helpers';
import { automationStore } from './store';
import { AutomationStep, AutomationTemplate } from './types';

type Section = 'Steps' | 'Preconditions' | 'Actions' | 'Transitions';

@Component
export default class AutomationEditor extends DialogBase {
  make = make;
  clear = clear;

  localDrawer: boolean | null = null;
  templateId: string | null = null;

  dragged: AutomationStep | null = null;
  section: Section = 'Steps';

  mounted(): void {
    this.selectActive(this.$route.params.id);
  }

  leaveEditor(): void {
    this.$router.back();
  }

  selectActive(templateId: string | null, stepId: string | null = null): void {
    this.templateId = templateId
      ?? this.$route.params.id
      ?? automationStore.activeTemplate
      ?? automationStore.templateIds[0]
      ?? null;

    if (this.templateId != this.$route.params.id) {
      this.$router.replace(`/automation/${this.templateId ?? ''}`);
    }
    const actualStepId = this.templateId === templateId ? stepId : null;
    automationStore.setActive([this.templateId, actualStepId]);
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

  initProcess(template: AutomationTemplate): void {
    automationStore.initProcess(template);
  }

  startAddTemplate(): void {
    createDialog({
      title: 'New template',
      message: 'Choose a name for your new template',
      cancel: true,
      prompt: {
        model: 'New Template',
        type: 'text',
      },
    }).onOk(async title => {
      const created: AutomationTemplate = {
        id: uid(),
        title,
        steps: [{
          id: uid(),
          title: 'Step one',
          preconditions: [],
          actions: [],
          transitions: [],
        }],
      };
      await automationStore.createTemplate(created);
      this.selectActive(created.id);
    });
  }

  startCopyTemplate(template: AutomationTemplate): void {
    createDialog({
      title: 'Copy template',
      message: 'Choose a name for your new template',
      cancel: true,
      prompt: {
        model: template.title,
        type: 'text',
      },
    }).onOk(async title => {
      const created: AutomationTemplate = {
        id: uid(),
        title,
        steps: template.steps.map(step => ({
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
      };
      await automationStore.createTemplate(created);
      this.selectActive(created.id);
    });
  }

  startRenameTemplate(template: AutomationTemplate): void {
    createDialog({
      title: 'Rename template',
      message: `Choose a new name for '${template.title}'`,
      cancel: true,
      prompt: {
        model: template.title,
        type: 'text',
      },
    }).onOk(title => this.saveTemplate({ ...template, title }));
  }

  startRemoveTemplate(template: AutomationTemplate): void {
    createDialog({
      title: 'Remove template',
      message: `Are you sure you want to remove '${template.title}'`,
      cancel: true,
    }).onOk(() => automationStore.removeTemplate(template));
  }

  startAddStep(template: AutomationTemplate): void {
    const step: AutomationStep = {
      id: uid(),
      title: 'New step',
      preconditions: [],
      actions: [],
      transitions: [],
    };
    template.steps.push(step);
    this.saveTemplate(template);
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

      <q-scroll-area
        class="col"
        :thumb-style="{opacity: 0.5, background: 'silver'}"
      >
        <q-item class="q-pb-none">
          <q-item-section class="text-bold">
            Templates
          </q-item-section>
        </q-item>
        <ActionItem
          v-for="tmpl in templates"
          :key="tmpl.id"
          :label="tmpl.title"
          :active="template && tmpl.id === template.id"
          :inset-level="0.2"
          class="ellipsis q-pa-none"
          style="min-height: 0"
          @click="selectActive(tmpl.id)"
        >
          <q-item-section class="col-auto" @click.stop>
            <ActionMenu class="col-auto">
              <template #actions>
                <ActionItem label="New Step" icon="add" @click="startAddStep(tmpl)" />
                <ActionItem label="Make" icon="add" @click="make" />
                <ActionItem label="Clear" icon="clear" @click="clear" />
                <ActionItem icon="mdi-play" label="Start Process" @click="initProcess(tmpl)" />
                <ActionItem icon="file_copy" label="Copy Template" @click="startCopyTemplate(tmpl)" />
                <ActionItem icon="edit" label="Rename Template" @click="startRenameTemplate(tmpl)" />
                <ActionItem icon="delete" label="Remove Template" @click="startRemoveTemplate(tmpl)" />
              </template>
            </ActionMenu>
          </q-item-section>
        </ActionItem>
        <div class="row q-pa-md justify-end">
          <q-btn
            flat
            round
            dense
            icon="add"
            color="secondary"
            @click="startAddTemplate"
          >
            <q-tooltip>New Template</q-tooltip>
          </q-btn>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <div v-if="step" class="page-height column no-wrap q-pa-md q-gutter-md">
          <q-tabs v-model="section">
            <q-tab
              name="Steps"
              :label="step ? `Step | ${step.title}` : 'Steps'"
              class="q-mr-lg text-secondary"
            />
            <q-tab name="Preconditions" label="Preconditions" />
            <q-tab name="Actions" label="Actions" />
            <q-tab name="Transitions" label="Transitions" />
          </q-tabs>
          <q-scroll-area visible class="col">
            <div class="row section-parent q-pl-lg justify-center">
              <AutomationSteps
                v-if="section === 'Steps'"
                :template="template"
                :step-id="stepId"
                @update:template="saveTemplate"
                @select="(v, s) => { selectActive(templateId, v); section = s; }"
              />
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
