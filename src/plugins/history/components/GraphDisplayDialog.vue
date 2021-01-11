<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/functional';

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
    return this.local!.renames[this.field] ?? defaultLabel(this.field);
  }

  set rename(val: string) {
    this.$set(this.local!.renames, this.field, val ?? defaultLabel(this.field));
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

  get precision(): number {
    return this.local!.precision[this.field] ?? 2;
  }

  set precision(val: number) {
    this.$set(this.local!.precision, this.field, val);
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>


<template>
  <q-dialog
    ref="dialog"
    v-bind="dialogProps"
    @hide="onDialogHide"
    @keyup.enter="save"
  >
    <DialogCard v-bind="{title, message, html}">
      <div class="column q-gutter-xs">
        <InputField
          v-model="rename"
          title="Label"
          label="Label"
        />
        <InputField
          v-model="precision"
          :decimals="0"
          :rules="[v => v >= 0 || 'Must be 0 or more']"
          type="number"
          title="Decimals in label"
          label="Decimals in label"
        />
        <ColorField
          v-model="color"
          title="Line color"
          label="Line color"
          null-text="automatic"
          clearable
        />
        <LabeledField label="Y-axis" class="depth-1">
          <q-btn-toggle
            v-model="axis"
            :options="axisOpts"
            flat
            class="depth-1"
          />
        </LabeledField>
      </div>

      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
