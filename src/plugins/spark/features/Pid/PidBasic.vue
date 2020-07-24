<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createBlockDialog, createDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { Block, PidBlock, SetpointSensorPairBlock } from '@/plugins/spark/types';

import { startRelationsDialog } from './relations';

@Component
export default class PidBasic
  extends BlockCrudComponent<PidBlock> {

  get inputBlock(): SetpointSensorPairBlock | null {
    return this.sparkModule.blockById(this.block.data.inputId.id);
  }

  get inputDriven(): boolean {
    return this.inputBlock !== null
      && this.sparkModule
        .drivenChains
        .some((chain: string[]) => chain[0] === this.inputBlock!.id);
  }

  get outputBlock(): Block | null {
    return this.sparkModule.blockById(this.block.data.outputId.id);
  }

  get kp(): number | null {
    return this.block.data.kp.value;
  }

  fit(v: number): number {
    return Math.min(v, 100);
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

    if (this.sparkModule.drivenBlocks.includes(id)) {
      const driveChain = this.sparkModule
        .drivenChains
        .find(chain => chain[0] === this.inputBlock?.id);

      const actual = driveChain !== undefined
        ? this.sparkModule.blockById(driveChain[driveChain.length - 1])
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
  <div class="widget-md q-mx-auto">
    <slot name="warnings" />

    <div class="widget-body row justify-center">
      <SettingValueField editable class="col-grow" @click="editInput">
        <template #header>
          Input
        </template>
        <template #valueIcon>
          <q-icon name="mdi-thermometer" color="green-3" />
        </template>
        <template #value>
          {{ block.data.inputValue | qty }}
        </template>
        <template #setting>
          {{ block.data.inputSetting | qty }}
        </template>
      </SettingValueField>
      <SettingValueField editable class="col-grow" @click="showOutput">
        <template #header>
          Output
        </template>
        <template #valueIcon>
          <q-icon
            v-if="kp === null"
            name="mdi-calculator-variant"
          />
          <HeatingIcon
            v-else-if="kp > 0"
            color="red"
            :svg-props="{'stroke-width': '2px'}"
          />
          <CoolingIcon
            v-else-if="kp < 0"
            color="dodgerblue"
            :svg-props="{'stroke-width': '2px'}"
          />
        </template>
        <template #value>
          {{ block.data.outputValue | round }} %
        </template>
        <template #setting>
          {{ block.data.outputSetting | round }} %
        </template>
      </SettingValueField>

      <div class="col-break" />

      <div class="col row no-wrap q-gutter-x-sm q-mr-md">
        <div class="col-auto self-center text-bold">
          P
        </div>
        <q-slider
          :value="fit(block.data.p)"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">
          I
        </div>
        <q-slider
          :value="fit(block.data.i)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div class="col-auto self-center text-bold">
          D
        </div>
        <q-slider
          :value="fit(block.data.d)"
          :max="100"
          readonly
          class="col-grow"
          thumb-path=""
        />

        <div
          v-if="!!block.data.boilMinOutput"
          :class="[
            'col-auto self-center text-bold',
            `text-${block.data.boilModeActive
              ? 'deep-orange'
              : 'grey'
            }`,
          ]"
        >
          boil
        </div>
      </div>
    </div>
  </div>
</template>
