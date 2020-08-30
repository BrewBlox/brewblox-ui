<script lang="ts">
import { date as qdate } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { ruleValidator } from '@/helpers/functional';

const dateExp = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

@Component
export default class DatetimeDialog extends DialogBase {
  dateString = '';
  timeString = '';

  @Prop({ type: Date, required: true })
  public readonly value!: Date;

  @Prop({ type: String, default: 'Date and time' })
  public readonly label!: string;

  @Prop({ type: String, default: 'restore' })
  readonly resetIcon!: string;

  @Prop({ type: Array, default: () => [] })
  public readonly rules!: InputRule[];

  created(): void {
    this.setStringVal(this.value);
  }

  get parsed(): Date | null {
    const combined = `${this.dateString} ${this.timeString}`;
    return dateExp.test(combined) && qdate.isValid(combined)
      ? qdate.extractDate(combined, 'YYYY/MM/DD HH:mm:ss')
      : null;
  }

  get parsedRules(): InputRule[] {
    return [
      () => this.parsed !== null || 'Invalid date',
      ...this.rules.map(rule => () => rule(this.parsed)),
    ];
  }

  get valid(): boolean {
    return ruleValidator(this.parsedRules)(this.parsed);
  }

  setStringVal(dateVal: Date): void {
    this.dateString = qdate.formatDate(dateVal, 'YYYY/MM/DD');
    this.timeString = qdate.formatDate(dateVal, 'HH:mm:ss');
  }

  save(): void {
    if (this.valid && this.parsed !== null) {
      this.onDialogOk(this.parsed);
    }
  }

  openPicker(): void {
    if (!this.valid) { return; }
    createDialog({
      component: 'DatepickerDialog',
      title: this.title,
      message: this.message,
      html: this.html,
      value: this.parsed,
      label: this.label,
    })
      .onOk(this.setStringVal);
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
      <q-item>
        <q-item-section>
          <q-input
            v-model="dateString"
            :rules="parsedRules"
            label="Date"
            hint="YYYY/MM/DD"
            mask="####/##/##"
            autofocus
          />
        </q-item-section>
        <q-item-section>
          <q-input
            v-model="timeString"
            :rules="parsedRules"
            label="Time"
            hint="HH:mm:ss"
            mask="##:##:##"
          />
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn :disable="!valid" icon="mdi-calendar-edit" flat dense @click="openPicker">
            <q-tooltip>Pick a date and time</q-tooltip>
          </q-btn>
        </q-item-section>
        <q-item-section class="col-auto">
          <q-btn
            :icon="resetIcon"
            flat
            dense
            class="text-white"
            @click="setStringVal(new Date())"
          >
            <q-tooltip>Reset to current date and time</q-tooltip>
          </q-btn>
        </q-item-section>
      </q-item>
      <template #actions>
        <q-btn flat color="primary" label="Cancel" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat color="primary" label="OK" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
