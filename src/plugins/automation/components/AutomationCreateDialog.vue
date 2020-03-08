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

  save(spec = this.selected): void {
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
    @keyup.ctrl.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div
        v-for="spec in specs"
        :key="spec.type"
        :class="[
          'col clickable q-pa-sm rounded-borders text-h6',
          selected === spec && 'depth-24',
        ]"
        @click="selectSpec(spec, false)"
        @dblclick="selectSpec(spec, true)"
      >
        {{ spec.title }}
      </div>
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
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
