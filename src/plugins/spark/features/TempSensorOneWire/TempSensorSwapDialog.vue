<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockAddress, BlockType, TempSensorOneWireBlock } from '@/plugins/spark/types';


@Component
export default class TempSensorSwapDialog extends DialogBase {
  leftAddr: BlockAddress | null = null;
  rightAddr: BlockAddress | null = null;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: String, required: false })
  public readonly leftId!: string;

  @Prop({ type: String, required: false })
  public readonly rightId!: string;

  @Prop({ type: String, default: 'Swap OneWire Temp Sensors' })
  public readonly title!: string;

  @Prop({ type: String, default: 'Pick two sensors to exchange their OneWire bus address.' })
  public readonly message!: string;

  created(): void {
    this.leftAddr = {
      id: this.leftId ?? null,
      type: BlockType.TempSensorOneWire,
      serviceId: this.serviceId,
    };
    this.rightAddr = {
      id: this.rightId ?? null,
      type: BlockType.TempSensorOneWire,
      serviceId: this.serviceId,
    };
  }

  get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  get leftBlock(): TempSensorOneWireBlock | null {
    return this.sparkModule.blockByAddress(this.leftAddr);
  }

  get rightBlock(): TempSensorOneWireBlock | null {
    return this.sparkModule.blockByAddress(this.rightAddr);
  }

  get valid(): boolean {
    return this.leftBlock !== null
      && this.rightBlock !== null
      && this.leftBlock.id !== this.rightBlock.id;
  }

  save(): void {
    if (this.leftBlock && this.rightBlock && this.leftBlock.id !== this.rightBlock.id) {
      const left = this.leftBlock.data.address;
      const right = this.rightBlock.data.address;
      this.leftBlock.data.address = right;
      this.rightBlock.data.address = left;
      this.sparkModule.saveBlock(this.leftBlock);
      this.sparkModule.saveBlock(this.rightBlock);
      this.onDialogOk();
    }
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
      <BlockAddressField
        v-model="leftAddr"
        label="Sensor A"
        title="Choose sensor A"
      />
      <BlockAddressField
        v-model="rightAddr"
        label="Sensor B"
        title="Choose sensor B"
      />
      <template #actions>
        <q-btn flat label="Cancel" color="primary" @click="onDialogCancel" />
        <q-btn :disable="!valid" flat label="OK" color="primary" @click="save" />
      </template>
    </DialogCard>
  </q-dialog>
</template>
