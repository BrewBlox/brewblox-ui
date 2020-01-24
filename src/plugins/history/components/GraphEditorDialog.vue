<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { deepCopy } from '@/helpers/units/parseObject';

import { emptyGraphConfig } from '../getters';
import { GraphConfig, SharedGraphConfig } from '../types';


@Component
export default class GraphEditorDialog extends DialogBase {
  local: GraphConfig | null = null;

  @Prop({ type: Boolean, default: false })
  public readonly noPeriod!: boolean;

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  @Prop({ type: Array, default: () => [] })
  public readonly shared!: SharedGraphConfig[];

  created(): void {
    this.local = {
      ...emptyGraphConfig(),
      ...deepCopy(this.config),
    };
  }

  loadShared(): void {
    createDialog({
      title: 'Import config',
      message: 'Copy configuration from another graph',
      options: {
        type: 'radio',
        model: '',
        items: this.shared.map(shared => ({ label: shared.title, value: shared.id })),
      },
      cancel: true,
    } as any)
      .onOk(id => {
        const shared = this.shared.find(s => s.id === id);
        if (shared) {
          this.local = {
            ...emptyGraphConfig(),
            ...deepCopy(shared.config),
          };
        }
      });
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>


<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <CardWrapper no-scroll v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="title" />
      </template>

      <div class="fit column">
        <q-scroll-area class="col">
          <GraphEditor :config.sync="local" :no-period="noPeriod" />
        </q-scroll-area>
        <q-card-actions class="col-auto" style="border-top: 1px solid silver">
          <q-btn flat label="Cancel" @click="onDialogCancel" />
          <q-space />
          <q-btn :disable="shared.length === 0" flat label="Import config" @click="loadShared">
            <q-tooltip>Copy configuration from another graph</q-tooltip>
          </q-btn>
          <q-btn unelevated label="Save" color="primary" @click="save" />
        </q-card-actions>
      </div>
    </CardWrapper>
  </q-dialog>
</template>
