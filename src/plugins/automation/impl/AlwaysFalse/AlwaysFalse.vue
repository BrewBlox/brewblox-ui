<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import AutomationItemBase from '@/plugins/automation/components/AutomationItemBase';
import { AlwaysFalseImpl } from '@/plugins/automation/types';

@Component
export default class TaskStatus extends AutomationItemBase<AlwaysFalseImpl> {

  editDesc(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Description',
      title: 'Description',
      value: this.impl.desc,
    })
      .onOk(desc => {
        this.impl.desc = desc;
        this.save();
      });
  }
}
</script>

<template>
  <div class="row q-gutter-xs">
    <LabeledField
      title="Description"
      label="Description"
      :readonly="false"
      class="col-grow"
      @click="editDesc"
    >
      {{ impl.desc || 'Click to edit' }}
    </LabeledField>
  </div>
</template>
