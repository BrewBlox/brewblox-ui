<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';

import ActionBase from './ActionBase';


interface TaskCreateOpts {
  ref: string;
  title: string;
  message: string;
  done: boolean;
}

@Component
export default class TaskCreate extends ActionBase<TaskCreateOpts> {


  editRef(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Reference ID',
      title: `Set reference ID for '${this.opts.title}'`,
      value: this.opts.ref,
    })
      .onOk(ref => {
        this.opts.ref = ref;
        this.saveAction();
      });
  }

  editTitle(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Title',
      title: 'Edit task title',
      value: this.opts.title,
    })
      .onOk(title => {
        this.opts.title = title;
        this.saveAction();
      });
  }

  editMessage(): void {
    createDialog({
      component: 'TextAreaDialog',
      parent: this,
      label: 'Message',
      title: `Edit '${this.opts.title}'`,
      value: this.opts.message,
    })
      .onOk(message => {
        this.opts.message = message;
        this.saveAction();
      });
  }
}
</script>

<template>
  <q-list dense :class="{'darkish': !action.enabled}">
    <q-item>
      <q-item-section class="text-h6 text-italic">
        Create Task
      </q-item-section>
      <q-item-section class="col-auto">
        <q-toggle :value="action.enabled" @input="saveEnabled">
          <q-tooltip>Toggle enabled</q-tooltip>
        </q-toggle>
      </q-item-section>
    </q-item>
    <q-item class="hoverable">
      <q-tooltip>Edit ref</q-tooltip>
      <q-item-section class="text-bold" @click="editRef">
        {{ opts.ref || 'Click to edit' }}
      </q-item-section>
    </q-item>
    <q-item class="hoverable">
      <q-tooltip>Edit title</q-tooltip>
      <q-item-section class="text-bold" @click="editTitle">
        {{ opts.title || 'Click to edit' }}
      </q-item-section>
    </q-item>
    <q-item class="hoverable">
      <q-tooltip>Edit message</q-tooltip>
      <q-item-section @click="editMessage">
        {{ opts.message || 'Click to edit' }}
      </q-item-section>
    </q-item>
  </q-list>
</template>
