<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { isCompatible } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { Temp, Unit } from '@/plugins/spark/units';
import { deepCopy } from '@/plugins/spark/units/parseObject';

import { analogOpTitles } from './getters';
import type { AnalogCompare } from './types';


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

  public get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  get tempUnit(): string {
    return this.sparkModule.units.Temp;
  }

  get operatorOpts(): SelectOption[] {
    return Object.entries(analogOpTitles)
      .map(([key, label]) => ({ label, value: Number(key) }));
  }

  get isTemp(): boolean {
    const block = this.sparkModule.blockById(this.local!.id.id);
    return !!block && isCompatible(block.type, 'SetpointSensorPairInterface');
  }

  get rhs(): Unit | number {
    const cmp = this.local!;
    return this.isTemp
      ? new Temp(cmp.rhs).convert(this.tempUnit)
      : cmp.rhs;
  }

  set rhs(v: Unit | number) {
    this.local!.rhs = v instanceof Unit
      ? new Temp(v).convert('degC').value ?? 0
      : v;
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
          @keyup.enter.exact.stop
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
