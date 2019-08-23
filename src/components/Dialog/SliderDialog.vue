<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';


@Component
export default class SliderDialog extends DialogBase {
  local = 0;

  @Prop({ type: Number })
  public readonly value!: number;

  @Prop({ type: Number, default: 0 })
  public readonly min!: number;

  @Prop({ type: Number, default: 100 })
  public readonly max!: number;

  @Prop({ type: Number, default: 1 })
  public readonly step!: number;

  @Prop({ type: String, default: 'Value' })
  public readonly label!: string;

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  save() {
    this.onDialogOk(this.local);
  }

  created() {
    this.local = this.value;
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
      <q-card-section>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>
              {{ label }}
            </q-item-label>
            <q-slider v-model="local" :min="min" :max="max" dark label-always />
          </q-item-section>
        </q-item>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
