<script lang="ts">
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { spliceById } from '@/helpers/functional';

import { automationStore } from './store';
import { AutomationStep, AutomationTemplate } from './types';

interface HasId {
  id: string;
}

@Component
export default class AutomationEditor extends DialogBase {
  drawerOpen = !this.$dense;
  dragged: AutomationStep | null = null;

  mounted(): void {
    if (this.routeId && this.routeId !== automationStore.activeTemplate) {
      automationStore.commitActive([this.routeId, null]);
    }
  }

  leaveEditor(): void {
    this.$router.back();
  }

  get routeId(): string | null {
    return this.$route.params.id ?? null;
  }

  get templateId(): string | null {
    return this.routeId
      ?? automationStore.activeTemplate
      ?? automationStore.templateIds[0]
      ?? null;
  }

  get templates(): AutomationTemplate[] {
    return automationStore.templateValues;
  }

  get template(): AutomationTemplate | null {
    return automationStore.templateById(
      this.routeId
      ?? automationStore.activeTemplate
      ?? automationStore.templateIds[0]
    );
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

  selectActive(template: AutomationTemplate | null, step: AutomationStep | null = null): void {
    automationStore.commitActive(
      template === null
        ? null
        : [template.id, step?.id ?? null]
    );
  }

  startAddTemplate(copy: boolean): void {
    copy;
  }

  startRenameTemplate(): void {
    if (this.template === null) {
      return;
    }
    createDialog({
      parent: this,
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
      parent: this,
      title: 'Remove template',
      message: `Are you sure you want to remove '${this.template.title}'`,
      cancel: true,
    }).onOk(() => this.template !== null && automationStore.removeTemplate(this.template));
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
              @click="selectActive(tmpl)"
            />
          </q-list>
        </q-btn-dropdown>
        <ActionMenu class="col-auto">
          <template #actions>
            <ActionItem label="New Template" icon="add" @click="startAddTemplate(false)" />
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
            style="min-height: 0px"
            @click="selectActive(template, step)"
          />
        </draggable>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page>
        <div v-if="step" class="page-height row no-wrap q-pa-md q-gutter-md">
          <AutomationActionSection :step="step" @update:step="saveStep" />
          <AutomationConditionSection :step="step" @update:step="saveStep" />
          <AutomationNoteSection :step="step" @update:step="saveStep" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
