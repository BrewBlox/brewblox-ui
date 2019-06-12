<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import serviceStore from '@/store/services';


@Component
export default class CreateActuatorsDialog extends DialogBase {

  @Prop({ type: Object, required: true })
  public readonly block!: Block;

}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="widget-modal">
      <FormToolbar @close="onDialogHide">
        <q-item-section>
          <q-item-label>{{ block.id }}</q-item-label>
          <q-item-label caption>Create Actuators</q-item-label>
        </q-item-section>
      </FormToolbar>

      <q-card-section>todo</q-card-section>
    </q-card>
  </q-dialog>
</template>
