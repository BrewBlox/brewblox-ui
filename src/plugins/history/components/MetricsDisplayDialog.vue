<script lang="ts">
import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { durationMs, durationString } from '@/helpers/functional';
import { deepCopy } from '@/helpers/units/parseObject';

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
    <DialogCard v-bind="{title, message, html}">
      <q-list dense>
        <InputField v-model="rename" title="Label" label="Label" />
        <InputField v-model="fresh" title="Warn when older than" label="Warn when older than" />
        <InputField
          v-model="decimals"
          :decimals="0"
          :rules="[v => v >= 0 || 'Must be 0 or more']"
          type="number"
          title="Number of decimals"
          label="Number of decimals"
        />
      </q-list>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
