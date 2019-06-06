<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import sparkStore from '@/plugins/spark/store';

@Component
export default class LinkDialog extends DialogBase {
  link: Link | null = null

  @Prop({ type: Object })
  public readonly value!: Link;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Function })
  readonly filter!: (link: Link) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly clearable!: boolean;

  get actualFilter() {
    if (this.filter) {
      return this.filter;
    }
    if (!this.value.type) {
      return () => true;
    }
    const compatibleTable = sparkStore.compatibleBlocks(this.serviceId);
    const compatible = compatibleTable[this.value.type] || [];
    return block => compatible.includes(block.id);
  }

  get linkOpts(): Link[] {
    return sparkStore.blockValues(this.serviceId)
      .map(block => new Link(block.id, block.type))
      .filter(this.actualFilter)
      .sort(objectStringSorter('id'));
  }

  updateLink(link: Link | null) {
    this.link = link || new Link(null, this.value.type);
  }

  created() {
    if (this.value.type) {
      sparkStore.fetchCompatibleBlocks([this.serviceId, this.value.type]);
    }
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
      <q-card-section class="q-dialog__title">{{ title }}</q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">{{ message }}</q-card-section>
      <q-card-section class="scroll">
        <q-select
          :value="link"
          :options="linkOpts"
          :clearable="clearable"
          dark
          options-dark
          option-label="id"
          option-value="id"
          label="Link"
          @input="updateLink"
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="onDialogCancel"/>
        <q-btn :disable="!clearable && !link" flat label="OK" @click="onDialogOk(link)"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
