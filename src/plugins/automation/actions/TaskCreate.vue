<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import { TaskCreateImpl } from '../types';
import ActionBase from './ActionBase';

@Component
export default class TaskCreate extends ActionBase<TaskCreateImpl> {

  editRef(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Reference ID',
      title: `Set reference ID for '${this.impl.title}'`,
      value: this.impl.ref,
    })
      .onOk(ref => {
        this.impl.ref = ref;
        this.saveAction();
      });
  }

  editTitle(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Title',
      title: 'Edit task title',
      value: this.impl.title,
    })
      .onOk(title => {
        this.impl.title = title;
        this.saveAction();
      });
  }

  editMessage(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Message',
      title: `Edit '${this.impl.title}'`,
      value: this.impl.message,
    })
      .onOk(message => {
        this.impl.message = message;
        this.saveAction();
      });
  }

  saveEnabled(val: boolean): void {
    this.action.enabled = val;
    this.saveAction();
  }
}
</script>

<template>
  <div class="row q-px-md q-gutter-xs">
    <AutomationFieldHeader
      :enabled="action.enabled"
      label="Create Task"
      class="col-grow"
      @update:enabled="saveEnabled"
    />

    <div class="col-break" />

    <LabeledField
      title="Title"
      label="Title"
      :readonly="false"
      class="col"
      @click="editTitle"
    >
      {{ impl.title || 'Click to edit' }}
    </LabeledField>
    <LabeledField
      title="Ref"
      label="Ref"
      :readonly="false"
      class="col"
      @click="editRef"
    >
      {{ impl.ref || 'Click to edit' }}
    </LabeledField>

    <div class="col-break" />

    <LabeledField
      title="Message"
      label="Message"
      :readonly="false"
      class="col"
      @click="editMessage"
    >
      {{ impl.message || 'Click to edit' }}
    </LabeledField>
  </div>
</template>
