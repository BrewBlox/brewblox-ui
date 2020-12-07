<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';

import { AutomationItem, AutomationSpec } from '../types';


@Component
export default class AutomationCreateDialog extends DialogBase {
  local: AutomationSpec | null = null;
  lastGeneratedName = '';
  name = '';

  @Prop({ type: Array, required: true })
  public readonly specs!: AutomationSpec[];

  get specOpts(): AutomationSpec[] {
    return this.specs.filter(v => !v.hidden);
  }

  get selected(): AutomationSpec | null {
    return this.local;
  }

  set selected(spec: AutomationSpec | null) {
    this.local = spec;
    this.updateName(spec);
  }

  updateName(spec: AutomationSpec | null) {
    if (spec && (!this.name || this.lastGeneratedName === this.name)) {
      this.name = spec.title;
      this.lastGeneratedName = this.name;
    }
  }

  showKeyboard(): void {
    createDialog({
      component: 'KeyboardDialog',
      value: this.name,
    })
      .onOk(v => this.name = v);
  }

  save(spec: AutomationSpec | null): void {
    if (spec) {
      this.updateName(spec);
      const item: AutomationItem = {
        id: uid(),
        title: this.name,
        enabled: true,
        impl: spec.generate(),
      };
      this.onDialogOk(item);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save(selected)"
  >
    <DialogCard v-bind="{title, message, html}">
      <ListSelect
        v-model="selected"
        :options="specOpts"
        option-value="type"
        option-label="title"
        @confirm="v => save(v)"
      />
      <template #actions>
        <q-input
          v-model="name"
          label="Name"
          clearable
          item-aligned
          class="col-12"
        >
          <template #append>
            <KeyboardButton @click="showKeyboard" />
          </template>
        </q-input>
        <q-btn
          flat
          label="Cancel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          :disable="!selected"
          flat
          label="OK"
          color="primary"
          @click="save(selected)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
