<script lang="ts">
import isNumber from 'lodash/isNumber';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { Temp } from '@/helpers/units';
import { deepCopy } from '@/helpers/units/parseObject';
import { sparkStore } from '@/plugins/spark/store';

import { interfaceTypes, isCompatible } from '../../block-types';
import { analogOpTitles } from './getters';
import { AnalogCompare } from './types';


@Component
export default class AnalogCompareEditDialog extends DialogBase {
  local: AnalogCompare | null = null;

  @Prop({ type: Object, required: true })
  public readonly value!: AnalogCompare;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  created(): void {
    this.local = deepCopy(this.value);
  }

  get tempUnit(): string {
    return sparkStore.units(this.serviceId).Temp;
  }

  get operatorOpts(): SelectOption[] {
    return Object.entries(analogOpTitles)
      .map(([key, label]) => ({ label, value: Number(key) }));
  }

  get isTemp(): boolean {
    const block = sparkStore.tryBlockById(this.serviceId, this.local!.id.id);
    return !!block && isCompatible(block.type, interfaceTypes.SetpointSensorPair);
  }

  get rhs(): Temp | number {
    const cmp = this.local!;
    return this.isTemp
      ? new Temp(cmp.rhs).convert(this.tempUnit)
      : cmp.rhs;
  }

  set rhs(v: Temp | number) {
    this.local!.rhs = isNumber(v)
      ? v
      : new Temp(v).convert('degC').value!;
  }

  save(): void {
    this.onDialogOk(this.local);
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide" @keyup.enter="save">
    <DialogCard v-bind="{title, message, html}">
      <LinkField
        v-model="local.id"
        :service-id="serviceId"
        title="target"
        label="Analog input"
      />
      <div class="row justify-between q-mt-sm q-pl-sm q-gutter-sm">
        <q-select
          v-model="local.op"
          :options="operatorOpts"
          map-options
          emit-value
          label="Operator"
          class="min-width-md col-auto"
        />
        <UnitField
          v-if="isTemp"
          v-model="rhs"
          label="Target value"
          class="col-grow"
        />
        <InputField
          v-else
          v-model="rhs"
          type="number"
          label="Target value"
          class="col-grow"
        />
      </div>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
