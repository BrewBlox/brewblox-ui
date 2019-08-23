<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';

@Component
export default class SelectDialog extends DialogBase {
  local: any = null;

  @Prop({ type: [String, Number, Array, Object], required: true })
  public readonly value!: any;

  @Prop({ type: Array, required: true })
  public readonly options!: any[];

  @Prop({ type: Object, default: () => ({}) })
  public readonly selectProps!: any;

  created() {
    this.local = this.value;
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="onDialogOk(local)">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-select v-model="local" :options="options" v-bind="selectProps" dark options-dark>
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" @click="onDialogCancel" />
        <q-btn
          :disable="!selectProps.clearable && local === null"
          color="primary"
          flat
          label="OK"
          @click="onDialogOk(local)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
