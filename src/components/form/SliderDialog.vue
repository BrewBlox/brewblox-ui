<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';


@Component
export default class SliderDialog extends DialogBase {
  local = 0;

  @Prop({ type: Number })
  public readonly value!: number;

  @Prop({ type: Number, default: 0 })
  public readonly min!: number;

  @Prop({ type: Number, default: 100 })
  public readonly max!: number;

  @Prop({ type: Number, default: 1 })
  public readonly step!: number;

  @Prop({ type: String, required: false })
  public readonly label!: string;

  @Prop({ type: Boolean, default: true })
  public readonly clearable!: boolean;

  @Prop({ type: Array, default: () => [] })
  public readonly quickActions!: SelectOption[];

  save(): void {
    this.onDialogOk(this.local);
  }

  apply(value: number): void {
    this.local = value;
    this.save();
  }

  created(): void {
    this.local = this.value;
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
      <q-item>
        <q-item-section class="q-pt-md">
          <q-slider v-model="local" :min="min" :max="max" label-always />
          <q-item-label v-if="label" caption>
            {{ label }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="quickActions.length">
        <q-item-section v-for="q in quickActions" :key="'quick'+q.value">
          <q-btn unelevated :label="q.label" @click="apply(q.value)" />
        </q-item-section>
      </q-item>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
