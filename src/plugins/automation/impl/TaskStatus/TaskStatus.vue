<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { AutomationStatus, TaskStatusImpl } from '@/plugins/automation/types';

const states: AutomationStatus[] = [
  'Created',
  'Active',
  'Finished',
  'Paused',
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

  get resetStatus(): AutomationStatus | null {
    return this.impl.resetStatus;
  }

  set resetStatus(val: AutomationStatus | null) {
    this.impl.resetStatus = val;
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
      message: 'All tasks with this ID will be checked.',
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
      class="col"
      @click="editRef"
    >
      {{ impl.ref || 'Click to edit' }}
    </LabeledField>
    <SelectField
      v-model="status"
      title="Desired status"
      label="Desired status"
      class="col"
      :options="statusOpts"
    />
    <SelectField
      v-model="resetStatus"
      title="Initial status"
      label="Initial status"
      message="
      Set a value to forcibly reset task status at step start.<br>
      This is useful when the same step is used multiple times.
      "
      html
      clearable
      :class="['col', resetStatus === null && 'fade-6']"
      :options="statusOpts"
    />
  </div>
</template>
