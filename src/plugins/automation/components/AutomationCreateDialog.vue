<script lang="ts">
import { uid } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

import { AutomationItem, AutomationSpec } from '../types';


@Component
export default class AutomationCreateDialog extends DialogBase {
  selected: AutomationSpec | null = null;

  @Prop({ type: Array, required: true })
  public readonly specs!: AutomationSpec[];

  selectSpec(spec: AutomationSpec, save: boolean): void {
    if (save) {
      this.save(spec);
    }
    this.selected = this.selected?.type !== spec.type
      ? spec
      : null;
  }

  save(spec: AutomationSpec | null): void {
    if (spec) {
      const item: AutomationItem = {
        id: uid(),
        title: spec.title,
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
        :options="specs"
        option-value="type"
        option-label="title"
        @confirm="v => save(v)"
      />
      <template #actions>
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
