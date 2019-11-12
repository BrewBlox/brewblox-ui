<script lang="ts">
import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/units/parseObject';

import { durationMs, durationString } from '../../../helpers/functional';
import { DEFAULT_DECIMALS, DEFAULT_FRESH_DURATION } from '../Metrics/getters';
import { MetricsConfig } from '../Metrics/types';
import { defaultLabel } from '../nodes';


@Component
export default class MetricsDisplayDialog extends DialogBase {
  local: MetricsConfig | null = null;

  @Prop({ type: Object, required: true })
  public readonly config!: MetricsConfig;

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

  get fresh(): string {
    return durationString(
      this.local!.freshDuration[this.field] || DEFAULT_FRESH_DURATION);
  }

  set fresh(val: string) {
    const ms = durationMs(val) || DEFAULT_FRESH_DURATION;
    this.$set(this.local!.freshDuration, this.field, ms);
  }

  get decimals(): number {
    return get(this.local!.decimals, this.field, DEFAULT_DECIMALS);
  }

  set decimals(val: number) {
    const numVal = val !== null ? val : DEFAULT_DECIMALS;
    this.$set(this.local!.decimals, this.field, numVal);
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
                Warn when older than
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <InputField v-model="fresh" title="Warn when older than" />
            </q-item-section>
          </q-item>
          <q-item dark>
            <q-item-section>
              <q-item-label caption>
                Number of decimals
              </q-item-label>
            </q-item-section>
            <q-item-section class="col-auto">
              <InputField
                v-model="decimals"
                :decimals="0"
                :rules="[v => v >= 0 || 'Must be 0 or more']"
                type="number"
                title="Number of decimals"
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
