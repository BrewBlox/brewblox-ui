<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '../DialogBase';


@Component
export default class CheckboxDialog extends DialogBase {
  local: any[] = [];

  @Prop({ type: Array, required: true })
  public readonly value!: any[];

  @Prop({ type: Array, required: true })
  public readonly selectOptions!: SelectOption[];

  @Prop({ type: String, default: 'OK' })
  public readonly ok!: string;

  @Prop({ type: [String, Boolean], default: true })
  public readonly cancel!: string | boolean;

  get cancelLabel(): string {
    return typeof this.cancel === 'string'
      ? this.cancel
      : 'Cancel';
  }

  created(): void {
    this.local = [...this.value];
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="q-gutter-sm">
        <q-checkbox
          v-for="(opt, idx) in selectOptions"
          :key="'opt-'+idx"
          v-model="local"
          :val="opt.value"
          :label="opt.label"
        />
      </div>
      <template #actions>
        <q-btn
          v-if="cancel"
          flat
          :label="cancelLabel"
          color="primary"
          @click="onDialogCancel"
        />
        <q-btn
          flat
          :label="ok"
          color="primary"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
