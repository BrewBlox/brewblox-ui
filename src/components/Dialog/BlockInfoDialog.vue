<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

@Component
export default class BlockInfoDialog extends DialogBase {

  @Prop({ type: String, default: 'Block info' })
  public readonly title!: string;

  @Prop({ type: Object, required: true })
  readonly block!: Block;

  get groupsDisplay() {
    const names = [...sparkStore.groupNames(this.block.serviceId), 'System Group'];
    return this.block.groups
      .map(val => names[val])
      .join(', ');
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml"/>
      <q-card-section class="scroll">
        <q-list dark>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Block ID</q-item-label>
              {{ block.id }}
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Block Type</q-item-label>
              {{ block.type }}
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>Service ID</q-item-label>
              {{ block.serviceId }}
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Active in groups</q-item-label>
              {{ groupsDisplay }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="OK" @click="onDialogOk"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
