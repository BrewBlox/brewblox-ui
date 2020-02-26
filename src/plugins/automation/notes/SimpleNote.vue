<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import AutomationItemBase from '../components/AutomationItemBase';
import { SimpleNoteImpl } from '../types';

@Component
export default class SimpleNote extends AutomationItemBase<SimpleNoteImpl> {

  get message(): string {
    return this.impl.message;
  }

  set message(val: string) {
    this.impl.message = val;
    this.save();
  }

  editMessage(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Message',
      title: `Edit '${this.item.title}'`,
      value: this.impl.message,
    })
      .onOk(message => {
        this.impl.message = message;
        this.save();
      });
  }


}
</script>

<template>
  <div class="row q-gutter-xs">
    <LabeledField
      title="Message"
      label="Message"
      :readonly="false"
      @click="editMessage"
    >
      {{ impl.message || 'Click to edit' }}
    </LabeledField>
  </div>
</template>
