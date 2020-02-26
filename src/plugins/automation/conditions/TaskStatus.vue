<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import AutomationItemBase from '../components/AutomationItemBase';
import { AutomationStatus, TaskStatusImpl } from '../types';

const states: AutomationStatus[] = [
  'Created',
  'Started',
  'Done',
  'Cancelled',
];

@Component
export default class TaskStatus extends AutomationItemBase<TaskStatusImpl> {

  get status(): AutomationStatus {
    return this.impl.status;
  }

  set status(val: AutomationStatus) {
    this.impl.status = val;
    this.save();
  }

  get statusOpts(): { label: AutomationStatus; value: AutomationStatus }[] {
    return states.map(v => ({ label: v, value: v }));
  }

  editRef(): void {
    createDialog({
      component: 'InputDialog',
      parent: this,
      label: 'Reference ID',
      title: 'Choose Task reference ID',
      message: 'This should match the reference ID of a task created in this process.',
      value: this.impl.ref,
    })
      .onOk(ref => {
        this.impl.ref = ref;
        this.save();
      });
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <LabeledField
      title="Ref"
      label="Reference ID"
      :readonly="false"
      class="col-grow"
      @click="editRef"
    >
      {{ impl.ref || 'Click to edit' }}
    </LabeledField>
    <SelectField
      v-model="status"
      title="Status"
      label="Status"
      class="col-grow"
      :options="statusOpts"
    />
  </div>
</template>
