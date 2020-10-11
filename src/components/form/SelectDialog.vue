<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class SelectDialog extends DialogBase {
  local: any = null;

  @Prop({ required: true })
  public readonly value!: any;

  @Prop({ type: Array, required: true })
  public readonly selectOptions!: any[];

  @Prop({ type: Object, default: () => ({}) })
  public readonly selectProps!: any;

  created(): void {
    this.local = this.value;
  }

  save(): void {
    if (this.local !== null || this.selectProps.clearable) {
      this.onDialogOk(this.local);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-select
        v-model="local"
        :options="selectOptions"
        v-bind="selectProps"
        item-aligned
        @keyup.enter.exact.stop
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <template #actions>
        <q-btn color="primary" flat label="Cancel" @click="onDialogCancel" />
        <q-btn
          :disable="!selectProps.clearable && local === null"
          color="primary"
          flat
          label="OK"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
