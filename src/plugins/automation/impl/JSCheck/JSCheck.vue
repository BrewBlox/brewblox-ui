<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { JSCheckImpl } from '@/plugins/automation/types';

import JSCheckDialog from './JSCheckDialog.vue';


@Component
export default class JSCheck extends AutomationItemBase<JSCheckImpl> {

  get displayText(): string {
    const lines = this.impl.body.split('\n');
    return lines.length > 20
      ? [...lines.slice(0, 20), '...'].join('\n')
      : this.impl.body;
  }

  editBody(): void {
    createDialog({
      component: JSCheckDialog,
      title: 'Edit condition',
      value: this.impl.body,
      saveFunc: v => { this.impl.body = v; this.save(); },
    });
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <LabeledField
      title="Code"
      label="Code"
      :readonly="false"
      class="col"
      @click="editBody"
    >
      <!-- No line breaks to allow correctly rendering whitespace -->
      <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
      <div style="white-space: pre-wrap">{{ displayText || 'Click to edit' }}</div>
    </LabeledField>
  </div>
</template>
