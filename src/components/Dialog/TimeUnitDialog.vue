<script lang="ts">
import parseDuration from 'parse-duration';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { durationString, unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';

@Component
export default class TimeUnitDialog extends DialogBase {
  local: string | null = null;

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  findUnit(s: string) {
    const match = s.match(/^[0-9\.]*([a-z]*)/i);
    return match && match[1]
      ? match[1]
      : '';
  }

  get defaultUnit() {
    return !this.findUnit(this.local || '')
      ? this.findUnit(unitDurationString(this.value))
      : '';
  }

  get localNumber() {
    return parseDuration(`${this.local}${this.defaultUnit}`);
  }

  normalize() {
    this.local = durationString(this.localNumber);
  }

  save() {
    const val = new Unit(this.localNumber, 'ms');
    this.onDialogOk(val);
  }

  created() {
    this.local = unitDurationString(this.value);
  }

}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-input
          v-model="local"
          :label="label"
          :suffix="defaultUnit"
          autofocus
          dark
          @change="normalize"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
