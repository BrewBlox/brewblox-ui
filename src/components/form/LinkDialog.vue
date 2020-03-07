<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { createBlockDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { isCompatible } from '@/plugins/spark/block-types';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

@Component
export default class LinkDialog extends DialogBase {
  link: Link | null = null

  @Prop({ type: Object })
  public readonly value!: Link;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, default: 'Link' })
  public readonly label!: string;

  @Prop({ type: Function, required: false })
  readonly typeFilter!: (type: string) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noConfigure!: boolean;

  created(): void {
    this.link = this.value.copy();
  }

  get actualFilter(): ((type: string) => boolean) {
    return this.typeFilter
      ? this.typeFilter
      : type => isCompatible(type, this.value.type);
  }

  get linkOpts(): Link[] {
    return sparkStore.blockValues(this.serviceId)
      .filter(block => this.actualFilter(block.type))
      .map(block => new Link(block.id, block.type))
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
    createBlockDialog(this.linkBlock);
  }

  create(): void {
    createDialog({
      component: 'BlockWizardDialog',
      parent: this,
      serviceId: this.serviceId,
      filter: this.actualFilter,
    })
      .onOk((block: Block) => {
        // Retain original type
        this.link = new Link(block.id, this.value.type);
      });
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
    <DialogCard v-bind="{title, message, html}">
      <q-select
        :value="link"
        :options="linkOpts"
        :clearable="clearable"
        :label="label"
        option-label="id"
        option-value="id"
        autofocus
        item-aligned
        @input="updateLink"
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
        <template #after>
          <q-btn v-if="!noConfigure && linkBlock" flat round icon="mdi-launch" @click="edit">
            <q-tooltip>Edit {{ link.id }}</q-tooltip>
          </q-btn>
          <q-btn v-else disable flat round icon="mdi-launch" />
          <q-btn v-if="!noCreate" flat round icon="add" @click="create">
            <q-tooltip>Create new Block</q-tooltip>
          </q-btn>
        </template>
      </q-select>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn
          :disable="!clearable && !link"
          flat
          label="OK"
          color="primary"
          @click="onDialogOk(link)"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
