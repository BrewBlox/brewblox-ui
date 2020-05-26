<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { objectStringSorter } from '@/helpers/functional';
import { sparkStore } from '@/plugins/spark/store';
import type { Block } from '@/plugins/spark/types';
import { deepCopy } from '@/plugins/spark/units/parseObject';

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
    return sparkStore.serviceBlocks(this.serviceId)
      .filter(this.filter)
      .sort(objectStringSorter('id'));
  }

  created(): void {
    this.block = deepCopy(this.value);
  }

  save(): void {
    if (this.block || this.clearable) {
      this.onDialogOk(this.block);
    }
  }
}
</script>

<template>
  <q-dialog
    ref="dialog"
    no-backdrop-dismiss
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <q-select
        v-model="block"
        :options="blockOpts"
        :clearable="clearable"
        :label="label"
        autofocus
        item-aligned
        option-label="id"
        option-value="id"
        @keyup.enter.exact.stop
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <template #actions>
        <q-btn color="primary" flat label="Cancel" @click="onDialogCancel" />
        <q-btn
          :disable="!clearable && !block"
          color="primary"
          flat
          label="OK"
          @click="save"
        />
      </template>
    </DialogCard>
  </q-dialog>
</template>
