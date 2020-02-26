<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';

import { automationStore } from './store';
import { AutomationConfig, AutomationTemplate } from './types';


@Component
export default class AutomationWidget extends WidgetBase<AutomationConfig> {
  get templates(): AutomationTemplate[] {
    return automationStore.templateValues;
  }

  startEditor(): void {
    this.$router.push('/automation');
  }
}
</script>

<template>
  <CardWrapper v-bind="{context}" @dblclick.native="startEditor">
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud">
        <template #actions>
          <ActionItem icon="settings" label="Editor" @click="startEditor" />
          <ActionItem icon="delete" label="Clear" @click="clear" />
        </template>
      </component>
    </template>

    <div class="widget-body column">
      <div v-for="template in templates" :key="template.id" class="col">
        {{ template.title }}
      </div>
    </div>
  </CardWrapper>
</template>
