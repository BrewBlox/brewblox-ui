<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { AutomationStatus, TaskEditImpl } from '@/plugins/automation/types';

const states: AutomationStatus[] = [
  'Created',
  'Active',
  'Finished',
  'Paused',
];

@Component
export default class TaskEdit extends AutomationItemBase<TaskEditImpl> {

  get status(): AutomationStatus | null {
    return this.impl.status;
  }

  set status(val: AutomationStatus | null) {
    this.impl.status = val;
    this.save();
  }

  get statusOpts(): { label: AutomationStatus; value: AutomationStatus }[] {
    return states.map(v => ({ label: v, value: v }));
  }

  editRef(): void {
    createDialog({
      component: 'InputDialog',
      label: 'Reference ID',
      title: `Set reference ID for '${this.impl.title}'`,
      value: this.impl.ref,
    })
      .onOk(ref => {
        this.impl.ref = ref;
        this.save();
      });
  }

  editTitle(): void {
    createDialog({
      component: 'InputDialog',
      label: 'Title',
      title: 'Edit task title',
      value: this.impl.title,
    })
      .onOk(title => {
        this.impl.title = title || null;
        this.save();
      });
  }

  editMessage(): void {
    createDialog({
      component: 'TextAreaDialog',
      label: 'Message',
      title: `Edit '${this.impl.title}'`,
      value: this.impl.message,
    })
      .onOk(message => {
        this.impl.message = message || null;
        this.save();
      });
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
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
      label="Reference ID"
      :readonly="false"
      class="col"
      @click="editRef"
    >
      {{ impl.ref || 'Click to edit' }}
    </LabeledField>
    <SelectField
      v-model="status"
      title="Status"
      label="Status"
      class="col"
      :options="statusOpts"
      clearable
    />

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
