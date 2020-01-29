<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { SetpointSensorPairBlock } from '@/plugins/spark/block-types';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import PidMini from './PidMini.vue';
import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component({
  components: {
    PidMini,
  },
})
export default class PidBasic
  extends BlockCrudComponent<PidBlock> {

  get inputBlock(): SetpointSensorPairBlock | null {
    return sparkStore.tryBlockById(this.serviceId, this.block.data.inputId.id);
  }

  get inputDriven(): boolean {
    return this.inputBlock !== null
      && sparkStore.drivenChains(this.serviceId)
        .some((chain: string[]) => chain[0] === this.inputBlock!.id);
  }

  get outputBlock(): Block | null {
    return sparkStore.tryBlockById(this.serviceId, this.block.data.outputId.id);
  }

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }

  showRelations(): void {
    startRelationsDialog(this.block);
  }

  showInput(): void {
    createBlockDialog(this.inputBlock);
  }

  editInput(): void {
    if (!this.inputBlock) return;

    const id = this.inputBlock.id;

    if (sparkStore.drivenBlocks(this.serviceId).includes(id)) {
      const driveChain = sparkStore
        .drivenChains(this.serviceId)
        .find(chain => chain[0] === this.inputBlock?.id);

      const actual = driveChain !== undefined
        ? sparkStore.tryBlockById(this.serviceId, driveChain[driveChain.length - 1])
        : this.inputBlock;

      this.showOtherBlock(actual);
    }
    else {
      createDialog({
        component: 'UnitDialog',
        title: 'Edit setting',
        message: `Edit ${id} setting`,
        parent: this,
        value: this.inputBlock.data.storedSetting,
        label: 'Setting',
      })
        .onOk(value => {
          if (this.inputBlock) {
            this.inputBlock.data.storedSetting = value;
            this.saveStoreBlock(this.inputBlock);
          }
        });
    }
  }

  showOutput(): void {
    createBlockDialog(this.outputBlock);
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div v-if="true" class="widget-body row justify-center">
      <PidMini :block="block" @edit:input="editInput" @edit:output="showOutput" />
    </div>

    <div v-else class="widget-body row">
      <UnitField
        v-if="!!inputBlock"
        :value="inputBlock.data.storedSetting"
        :readonly="inputDriven"
        :class="{darkened: !inputBlock.data.settingEnabled}"
        label="Input setting"
        tag="big"
        class="col min-width-sm"
        @input="v => { inputBlock.data.storedSetting = v; saveStoreBlock(inputBlock); }"
      />
      <UnitField
        v-else
        :value="block.data.inputSetting"
        label="Input setting"
        tag="big"
        readonly
        class="col min-width-sm"
      />
      <UnitField
        :value="block.data.inputValue"
        label="Input measured"
        tag="big"
        readonly
        class="col min-width-sm"
      />
      <q-btn
        label="Open"
        icon="mdi-launch"
        flat
        no-caps
        class="depth-1 col min-width-sm"
        @click="showInput"
      />

      <div class="col-break" />

      <LabeledField
        :value="block.data.outputSetting"
        number
        label="Output target"
        tag="big"
        class="col min-width-sm"
      />
      <LabeledField
        :value="block.data.outputValue"
        number
        label="Output achieved"
        tag="big"
        class="col min-width-sm"
      />
      <q-btn
        label="Open"
        icon="mdi-launch"
        flat
        no-caps
        class="depth-1 col min-width-sm"
        @click="showOutput"
      />

      <div class="col-break" />

      <LabeledField
        :value="block.data.p"
        label="P"
        number
        class="col min-width-sm"
      />
      <LabeledField
        :value="block.data.i"
        label="I"
        number
        class="col min-width-sm"
      />
      <LabeledField
        :value="block.data.d"
        label="D"
        number
        class="col min-width-sm"
      />
    </div>
  </div>
</template>
