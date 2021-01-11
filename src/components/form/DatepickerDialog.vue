<script lang="ts">
import { date as qdate } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';

@Component
export default class DatepickerDialog extends DialogBase {
  tab = 'date';
  stringValue = '';

  @Prop({ type: Date, required: true })
  public readonly value!: Date;

  @Prop({ type: String, default: 'Date and time' })
  public readonly label!: string;

  get parsed(): Date {
    return qdate.extractDate(this.stringValue, 'YYYY/MM/DD HH:mm:ss');
  }

  get valid(): boolean {
    return !Number.isNaN(this.parsed.getTime());
  }

  setStringVal(dateVal: Date): void {
    this.stringValue = qdate.formatDate(dateVal, 'YYYY/MM/DD HH:mm:ss');
  }

  save(): void {
    if (this.valid) {
      this.onDialogOk(this.parsed);
    }
  }

  created(): void {
    this.setStringVal(this.value);
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
      <template #body>
        <q-tabs v-model="tab" dense active-color="primary" align="justify" narrow-indicator>
          <q-tab name="date" label="Date" />
          <q-tab name="time" label="Time" />
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="date" class="q-pa-none">
            <q-date
              v-model="stringValue"
              mask="YYYY/MM/DD HH:mm:ss"
              class="fit"
              @input="tab='time'"
            />
          </q-tab-panel>
          <q-tab-panel name="time" class="q-pa-none">
            <q-time v-model="stringValue" mask="YYYY/MM/DD HH:mm:ss" class="fit" />
          </q-tab-panel>
        </q-tab-panels>
      </template>
      <template #actions>
        <q-btn flat color="primary" label="Cancel" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat color="primary" label="OK" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
