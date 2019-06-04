<script lang="ts">
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { objectStringSorter } from '@/helpers/functional';
import sparkStore from '@/plugins/spark/store';

import { Block } from '../types';

@Component({
  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    serviceId: {
      type: String,
      required: true,
    },
    filter: {
      type: Function,
      default: () => () => true,
    },
  },
})
export default class BlockChoiceDialog extends DialogBase {
  block: Block | null = null

  get blockOpts() {
    return sparkStore.blockValues(this.$props.serviceId)
      .filter(this.$props.filter)
      .sort(objectStringSorter('id'));
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section class="scroll">
        <q-select
          v-model="block"
          :options="blockOpts"
          dark
          options-dark
          option-label="id"
          label="Block"
          color="amber"
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="amber" label="Cancel" @click="onDialogCancel"/>
        <q-btn :disable="!block" flat color="amber" label="OK" @click="onDialogOk(block)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
