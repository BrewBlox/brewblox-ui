<script lang="ts">
import { uid } from 'quasar';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';

import { idCopy } from './helpers';
import { automationStore } from './store';
import { AutomationStep, AutomationTemplate } from './types';


@Component({
  components: {
    AutomationEditor: () => import('./AutomationEditor.vue'),
  },
})
export default class AutomationPage extends Vue {
  localDrawer: boolean | null = null;

  mounted(): void {
    this.updateActive(null, null);
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

  get automationAvailable(): boolean {
    return automationStore.available;
  }

  get templateId(): string | null {
    return this.$route.params.id ?? null;
  }

  get templates(): AutomationTemplate[] {
    return [...automationStore.templates].sort(objectStringSorter('title'));
  }

  get template(): AutomationTemplate | null {
    return automationStore.templateById(this.templateId);
  }

  get stepId(): string | null {
    return automationStore.activeStep
      ?? this.template?.steps[0]?.id
      ?? null;
  }

  leavePage(): void {
    this.$router.back();
  }

  updateActive(templateId: string | null, stepId: string | null): void {
    const storedTemplate = automationStore.activeTemplate;
    const storedStep = automationStore.activeStep;

    if (templateId) {
      this.applyActive(templateId, stepId);
    }
    else if (this.templateId) {
      const newStepId = storedTemplate === this.templateId
        ? storedStep
        : null;
      this.applyActive(this.templateId, newStepId);
    }
    else if (storedTemplate) {
      this.applyActive(storedTemplate, storedStep);
    }
    else if (automationStore.templates.length > 0) {
      const template = automationStore.templates[0];
      this.applyActive(template.id, template.steps[0]?.id ?? null);
    }
  }

  applyActive(templateId: string | null, stepId: string | null): void {
    automationStore.setActive([templateId, stepId]);
    if (templateId && templateId !== this.templateId) {
      this.$router.replace(`/automation/${templateId}`).catch(() => { });
    }
  }

  saveTemplate(template: AutomationTemplate | null = this.template): void {
    if (template) {
      automationStore.saveTemplate(template);
    }
  }

  initProcess(template: AutomationTemplate): void {
    automationStore.initProcess(template);
  }

  startAddTemplate(): void {
    createDialog({
      component: 'InputDialog',
      title: 'New template',
      message: 'Choose a name for your new template',
      value: 'New Template',
    })
      .onOk(async title => {
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
        this.updateActive(created.id, null);
      });
  }

  startCopyTemplate(template: AutomationTemplate): void {
    createDialog({
      component: 'InputDialog',
      title: 'Copy template',
      message: 'Choose a name for your new template',
      value: template.title,
    })
      .onOk(async title => {
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
        this.updateActive(created.id, null);
      });
  }

  startRenameTemplate(template: AutomationTemplate): void {
    createDialog({
      component: 'InputDialog',
      title: 'Rename template',
      message: `Choose a new name for '${template.title}'`,
      value: template.title,
    })
      .onOk(title => this.saveTemplate({ ...template, title }));
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
          @click="leavePage"
        />
      </template>
    </LayoutHeader>
    <LayoutFooter />

    <q-drawer v-model="drawerOpen" content-class="column" elevated>
      <SidebarNavigator />

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
          v-for="(tmpl, idx) in templates"
          :key="`${tmpl.id}-${idx}`"
          :label="tmpl.title"
          :active="template && tmpl.id === template.id"
          :inset-level="0.2"
          class="ellipsis q-pa-none"
          style="min-height: 0"
          @click="updateActive(tmpl.id, null)"
        >
          <q-item-section class="col-auto" @click.stop>
            <ActionMenu class="col-auto">
              <template #actions>
                <ActionItem icon="mdi-play" label="Create process" @click="initProcess(tmpl)" />
                <ActionItem label="New Step" icon="add" @click="startAddStep(tmpl)" />
                <ActionItem icon="file_copy" label="Copy template" @click="startCopyTemplate(tmpl)" />
                <ActionItem icon="edit" label="Rename template" @click="startRenameTemplate(tmpl)" />
                <ActionItem icon="delete" label="Remove template" @click="startRemoveTemplate(tmpl)" />
              </template>
            </ActionMenu>
          </q-item-section>
        </ActionItem>
        <div class="row q-pa-md justify-end">
          <q-btn
            flat
            dense
            icon="add"
            color="secondary"
            label="New template"
            @click="startAddTemplate"
          />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <AutomationEditor
        v-if="template"
        :template-id="templateId"
        :step-id="stepId"
        @update:active="updateActive"
      />
      <q-page v-else class="text-h5 darkened">
        <div v-if="automationAvailable" class="absolute-center">
          Please select a template
        </div>
        <CardWarning v-else class="absolute-center">
          <template #message>
            The automation service is not available. <br>
            This feature is still in preview.
          </template>
        </CardWarning>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
