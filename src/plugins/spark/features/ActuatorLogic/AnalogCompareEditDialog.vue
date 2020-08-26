<script lang="ts">
import { Enum } from 'typescript-string-enums';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { bloxQty, isQuantity } from '@/helpers/bloxfield';
import { deepCopy } from '@/helpers/functional';
import { isCompatible } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { AnalogCompare, AnalogCompareOp, BlockIntfType, Quantity } from '@/plugins/spark/types';

import { analogOpTitles } from './getters';


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
    return Enum.values(AnalogCompareOp)
      .map(value => ({ value, label: analogOpTitles[value] }));
  }

  get isTemp(): boolean {
    const block = this.sparkModule.blockById(this.local!.id.id);
    return !!block && isCompatible(block.type, BlockIntfType.SetpointSensorPairInterface);
  }

  get rhs(): Quantity | number {
    const cmp = this.local!;
    return this.isTemp
      ? bloxQty(cmp.rhs, 'degC').to(this.tempUnit)
      : cmp.rhs;
  }

  set rhs(v: Quantity | number) {
    this.local!.rhs = isQuantity(v)
      ? bloxQty(v).to('degC').value ?? 0
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
          class="col"
          @keyup.enter.exact.stop
        />
        <QuantityField
          v-if="isTemp"
          v-model="rhs"
          label="Target value"
          class="col"
        />
        <InputField
          v-else
          v-model="rhs"
          type="number"
          label="Target value"
          class="col"
        />
      </div>
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
