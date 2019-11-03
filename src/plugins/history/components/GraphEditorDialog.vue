<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';

import { GraphConfig } from '../types';


@Component
export default class GraphEditorDialog extends DialogBase {
  local: GraphConfig | null = null;

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  created(): void {
    this.local = {
      layout: {},
      params: {},
      targets: [],
      renames: {},
      colors: {},
      axes: {},
      ...deepCopy(this.config),
    };
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>


<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="widget-modal" dark>
      <DialogToolbar>{{ title }}</DialogToolbar>
      <q-card-section class="scroll" style="max-height: 80vh">
        <GraphEditor :config.sync="local" />
      </q-card-section>
      <q-separator dark />
      <q-card-actions>
        <q-btn flat label="Cancel" @click="onDialogCancel" />
        <q-space />
        <q-btn flat label="Save" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
