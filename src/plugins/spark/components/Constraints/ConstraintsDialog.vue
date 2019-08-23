<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';

import { ConstraintsObj } from './ConstraintsBase';

@Component
export default class InputDialog extends DialogBase {
  local: ConstraintsObj | null = null;

  @Prop({ type: Object, default: () => ({ constraints: [] }) })
  protected readonly value!: ConstraintsObj;

  @Prop({ type: String, required: true })
  protected readonly serviceId!: string;

  @Prop({ type: String, required: true, validator: v => ['analog', 'digital'].includes(v) })
  public readonly type!: string;

  get component() {
    return this.type === 'analog'
      ? 'AnalogConstraints'
      : 'DigitalConstraints';
  }

  save() {
    this.onDialogOk(this.local);
  }

  created() {
    this.local = deepCopy(this.value);
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
        <component :is="component" v-model="local" :service-id="serviceId" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
