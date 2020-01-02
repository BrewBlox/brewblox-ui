<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createBlockDialog } from '@/helpers/dialog';
import { SetpointSensorPairBlock } from '@/plugins/spark/block-types';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component
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

  showOutput(): void {
    createBlockDialog(this.outputBlock);
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item class="items-start">
        <q-item-section>
          <UnitField
            v-if="!!inputBlock"
            :value="inputBlock.data.storedSetting"
            :readonly="inputDriven"
            :class="{darkened: !inputBlock.data.settingEnabled}"
            label="Input setting"
            tag="big"
            @input="v => { inputBlock.data.storedSetting = v; saveStoreBlock(inputBlock); }"
          />
          <UnitField v-else :value="block.data.inputSetting" label="Input setting" tag="big" readonly />
        </q-item-section>
        <q-item-section>
          <UnitField :value="block.data.inputValue" label="Input measured" tag="big" readonly />
        </q-item-section>
        <q-item-section :class="{hoverable: !!inputBlock}">
          <LabeledField label="Show block" @click="showInput">
            <q-icon :class="{darkish: !inputBlock}" name="mdi-launch" size="24px" />
          </LabeledField>
        </q-item-section>
      </q-item>

      <q-separator inset />

      <q-item class="items-start">
        <q-item-section>
          <LabeledField :value="block.data.outputSetting" number label="Output target" tag="big" />
        </q-item-section>
        <q-item-section>
          <LabeledField :value="block.data.outputValue" number label="Output achieved" tag="big" />
        </q-item-section>
        <q-item-section :class="{hoverable: !!outputBlock}">
          <LabeledField label="Show block" @click="showOutput">
            <q-icon :class="{darkish: !outputBlock}" name="mdi-launch" size="24px" />
          </LabeledField>
        </q-item-section>
      </q-item>

      <q-separator inset />

      <q-item>
        <q-item-section>
          <LabeledField :value="block.data.p" label="P" number />
        </q-item-section>
        <q-item-section>
          <LabeledField :value="block.data.i" label="I" number />
        </q-item-section>
        <q-item-section>
          <LabeledField :value="block.data.d" label="D" number />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<style lang="scss" scoped>
.q-card__section .q-separator {
  opacity: 0.2;
}
</style>
