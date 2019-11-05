<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';

import { defaultLabel } from '../nodes';
import { GraphConfig } from '../types';


@Component
export default class GraphDisplayDialog extends DialogBase {
  local: GraphConfig | null = null;
  axisOpts: SelectOption[] = [
    {
      value: 'y',
      label: 'Y1',
    },
    {
      value: 'y2',
      label: 'Y2',
    },
  ];

  @Prop({ type: Object, required: true })
  public readonly config!: GraphConfig;

  @Prop({ type: String, required: true })
  public readonly field!: string;

  created(): void {
    this.local = deepCopy(this.config);
  }

  get rename(): string {
    return this.local!.renames[this.field] || defaultLabel(this.field);
  }

  set rename(val: string) {
    this.$set(this.local!.renames, this.field, val || defaultLabel(this.field));
  }

  get axis(): GraphConfig['axes'][''] {
    return this.local!.axes[this.field] || 'y';
  }

  set axis(val: GraphConfig['axes']['']) {
    this.$set(this.local!.axes, this.field, val);
  }

  get color(): string {
    return this.local!.colors[this.field] || '';
  }

  set color(val: string) {
    this.$set(this.local!.colors, this.field, val);
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>


<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <q-card class="q-dialog-plugin q-dialog-plugin--dark" dark>
      <q-card-section class="q-dialog__title ellipsis">
        {{ title }}
      </q-card-section>
      <q-card-section v-if="message" class="q-dialog__message scroll">
        {{ message }}
      </q-card-section>
      <q-card-section v-if="messageHtml" class="q-dialog__message scroll" v-html="messageHtml" />
      <q-card-section class="scroll">
        <q-list dark dense>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>
                Label
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <InputField v-model="rename" title="Label" />
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>
                Line color
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <ColorField
                v-model="color"
                title="Line color"
                null-text="automatic"
                clearable
              />
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>
                Y-axis
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <q-btn-toggle
                v-model="axis"
                :options="axisOpts"
                flat
                stretch
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
