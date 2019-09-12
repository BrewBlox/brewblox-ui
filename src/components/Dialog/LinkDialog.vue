<script lang="ts">
import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';

import { showBlockDialog } from '../../helpers/dialog';
import { Block } from '../../plugins/spark/types';

@Component
export default class LinkDialog extends DialogBase {
  link: Link | null = null

  @Prop({ type: Object })
  public readonly value!: Link;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, default: 'Link' })
  public readonly label!: string;

  @Prop({ type: Function })
  readonly filter!: (link: Link) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  get compatibleTypes(): string[] | null {
    if (!this.value.type) {
      return null;
    }
    const compatibleTable = sparkStore.compatibleTypes(this.serviceId);
    return [this.value.type, ...get(compatibleTable, this.value.type, [])];
  }

  get actualFilter(): (link: Link) => boolean {
    if (this.filter) {
      return this.filter;
    }
    return block => !this.compatibleTypes || this.compatibleTypes.includes(block.type || '');
  }

  get linkOpts(): Link[] {
    return sparkStore.blockValues(this.serviceId)
      .map(block => new Link(block.id, block.type))
      .filter(this.actualFilter)
      .sort(objectStringSorter('id'));
  }

  get linkBlock(): Block | null {
    return this.link && this.link.id
      ? sparkStore.tryBlockById(this.serviceId, this.link.id)
      : null;
  }

  updateLink(link: Link | null): void {
    this.link = link || new Link(null, this.value.type);
  }

  edit(): void {
    showBlockDialog(this.linkBlock);
  }

  create(): void {
    createDialog({
      component: 'BlockWizardDialog',
      root: this.$root,
      serviceId: this.serviceId,
      filter: feat => !this.compatibleTypes || this.compatibleTypes.includes(feat),
    })
      .onOk((block: Block) => {
        // Retain original type
        this.link = new Link(block.id, this.value.type);
      });
  }

  created(): void {
    this.link = this.value.copy();
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="(link || clearable) && onDialogOk(link)"
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
          :value="link"
          :options="linkOpts"
          :clearable="clearable"
          :label="label"
          dark
          options-dark
          option-label="id"
          option-value="id"
          autofocus
          @input="updateLink"
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
          <template v-if="!noCreate" v-slot:after>
            <q-btn v-if="linkBlock" flat round icon="mdi-pencil" @click="edit">
              <q-tooltip>Edit {{ link.id }}</q-tooltip>
            </q-btn>
            <q-btn v-else disable flat round icon="mdi-pencil-off" />
            <q-btn flat round icon="add" @click="create">
              <q-tooltip>Create new Block</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn
          :disable="!clearable && !link"
          flat
          label="OK"
          color="primary"
          @click="onDialogOk(link)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
