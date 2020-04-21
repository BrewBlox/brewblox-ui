<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

import { shortDateString } from '../../helpers/functional';
import { sparkStore } from '../spark/store';
import { AutomationProcess } from './shared-types';
import { automationStore } from './store';
import { AutomationConfig, AutomationTemplate } from './types';


@Component
export default class AutomationWidget extends WidgetBase<AutomationConfig> {
  get templates(): AutomationTemplate[] {
    return automationStore.templates;
  }

  get processes(): AutomationProcess[] {
    return automationStore.processes;
  }

  startEditor(): void {
    this.$router.push('/automation');
  }

  init(template: AutomationTemplate): void {
    automationStore.initProcess(template);
  }

  remove(proc: AutomationProcess): void {
    automationStore.removeProcess(proc);
  }

  @Watch('processes')
  forceUpdate(): void {
    sparkStore.moduleById('sparkey')?.fetchBlocks();
  }

  lastResult(proc: AutomationProcess): string {
    const stepTitle = id => proc.steps.find(v => v.id === id)?.title ?? 'Unknown';
    return [...proc.results]
      .reverse()
      .slice(0, 10)
      .reverse()
      .map(res => `${shortDateString(res.date)} | ${stepTitle(res.stepId)} | ${res.stepStatus} ${res.error ?? ''}`)
      .join('\n');
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}" @dblclick.native="startEditor">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud">
        <template #actions>
          <ActionItem icon="settings" label="Editor" @click="startEditor" />
        </template>
      </component>
    </template>

    <div class="widget-body column">
      <div>Templates</div>
      <div
        v-for="template in templates"
        :key="template.id"
        class="clickable rounded-borders depth-1 q-pa-sm"
        @click="init(template)"
      >
        {{ template.title }}
      </div>
      <div>Processes</div>
      <div
        v-for="proc in processes"
        :key="proc.id"
        class="clickable rounded-borders depth-1 q-pa-sm"
        @click="remove(proc)"
      >
        <div>{{ proc.title }}</div>
        <div style="white-space: pre-line">
          {{ lastResult(proc) }}
        </div>
      </div>
    </div>
  </CardWrapper>
</template>
