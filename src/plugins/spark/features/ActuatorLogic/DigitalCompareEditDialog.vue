<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { deepCopy } from '@/helpers/functional';
import { DigitalCompare } from '@/plugins/spark/types';

import { digitalOpTitles } from './getters';


@Component
export default class DigitalCompareEditDialog extends DialogBase {
  local: DigitalCompare | null = null;

  @Prop({ type: Object, required: true })
  public readonly value!: DigitalCompare;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  created(): void {
    this.local = deepCopy(this.value);
  }

  get operatorOpts(): SelectOption[] {
    return Object.entries(digitalOpTitles)
      .map(([key, label]) => ({ label, value: Number(key) }));
  }

  save(): void {
    this.onDialogOk(this.local);
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
      <LinkField
        v-model="local.id"
        :service-id="serviceId"
        title="target"
        label="Digital actuator input"
        clearable
      />
      <div class="row justify-between q-px-sm">
        <q-select
          v-model="local.op"
          :options="operatorOpts"
          map-options
          emit-value
          label="Operator"
          class="min-width-md col-auto"
          @keyup.enter.exact.stop
        />
        <DigitalStateButton
          v-model="local.rhs"
          class="self-center"
        />
      </div>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
