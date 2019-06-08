<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { Unit } from '@/helpers/units';

@Component
export default class UnitDialog extends DialogBase {
  local: Unit | null = null;

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

  created() {
    this.local = this.value.copy();
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="onDialogOk(local)">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml"/>
      <q-card-section class="scroll">
        <q-input
          :value="local.value"
          input-style="font-size: 170%"
          type="number"
          step="any"
          label="Value"
          dark
          clearable
          @input="v => local.value = v"
        >
          <template v-slot:append>{{ local.notation }}</template>
        </q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel"/>
        <q-btn flat label="OK" color="primary" @click="onDialogOk(local)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
