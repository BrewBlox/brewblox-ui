<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

@Component
export default class BlockInfoDialog extends DialogBase {

  @Prop({ type: String, default: 'Block info' })
  public readonly title!: string;

  @Prop({ type: Object, required: true })
  readonly block!: Block;

  get groupsDisplay(): string {
    const names = [...sparkStore.groupNames(this.block.serviceId), 'System Group'];
    return this.block.groups
      .map(val => names[val])
      .join(', ');
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <DialogCard v-bind="{title, message, html}">
      <q-list>
        <q-item>
          <q-item-section>
            <LabeledField :value="block.id" label="Block ID" />
          </q-item-section>
          <q-item-section>
            <LabeledField :value="block.type" label="Block Type" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <LabeledField :value="block.serviceId" label="Service ID" />
          </q-item-section>
          <q-item-section>
            <LabeledField :value="groupsDisplay" label="Active in groups" />
          </q-item-section>
        </q-item>
      </q-list>
      <template #actions>
        <q-btn flat color="primary" label="OK" @click="onDialogOk" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
