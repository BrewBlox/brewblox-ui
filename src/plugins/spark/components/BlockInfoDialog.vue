<script lang="ts">
import { Component } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import sparkStore from '@/plugins/spark/store';

@Component({
  props: {
    block: {
      type: Object,
      required: true,
    },
  },
})
export default class BlockInfoDialog extends DialogBase {
  get groupsDisplay() {
    const names = [...sparkStore.groupNames(this.$props.block.serviceId), 'System Group'];
    return this.$props.block.groups
      .map(val => names[val])
      .join(', ');
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title">Block info: {{ block.id }}</q-card-section>
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
        <q-btn flat color="amber" label="OK" @click="onDialogOk"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
