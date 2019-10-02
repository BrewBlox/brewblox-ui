<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { objectStringSorter } from '@/helpers/functional';
import { deepCopy } from '@/helpers/units/parseObject';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

@Component
export default class BlockSelectDialog extends DialogBase {
  block: Block | null = null

  @Prop({ type: Object })
  public readonly value!: Block;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Function, default: () => () => true })
  readonly filter!: (block: Block) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  get blockOpts(): Block[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(this.filter)
      .sort(objectStringSorter('id'));
  }

  created(): void {
    this.block = deepCopy(this.value);
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="block && onDialogOk(block)"
  >
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-select
          v-model="block"
          :options="blockOpts"
          :clearable="clearable"
          :label="label"
          dark
          autofocus
          options-dark
          option-label="id"
          option-value="id"
        >
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
          :disable="!clearable && !block"
          color="primary"
          flat
          label="OK"
          @click="onDialogOk(block)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
