<script lang="ts">
import { Component } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';

import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component
export default class PidBasic extends BlockCrudComponent {
  readonly block!: PidBlock;
  inputFormOpen = false;
  relationsOpen = false;

  get inputId(): string | null {
    return this.block.data.inputId.id;
  }

  get outputId(): string | null {
    return this.block.data.outputId.id;
  }

  get hasInputBlock(): boolean {
    return !!this.inputId
      && sparkStore
        .blockIds(this.serviceId)
        .includes(this.inputId);
  }

  get hasOutputBlock(): boolean {
    return !!this.outputId
      && sparkStore
        .blockIds(this.serviceId)
        .includes(this.outputId);
  }

  enable(): void {
    this.block.data.enabled = true;
    this.saveBlock();
  }

  showRelations(): void {
    startRelationsDialog(this.block);
  }

  showInput(): void {
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.inputId));
  }

  showOutput(): void {
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.outputId));
  }
}
</script>

<template>
  <q-card v-bind="$attrs">
    <slot name="toolbar" />
    <slot name="warnings" />

    <q-card-section>
      <q-item :clickable="hasInputBlock" @click="showInput">
        <q-tooltip v-if="hasInputBlock">
          Edit {{ inputId }}
        </q-tooltip>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-mb-xs">
            Input
          </div>
        </q-item-section>
        <q-item-section>
          <UnitField :value="block.data.inputSetting" label="Target" tag="big" readonly />
        </q-item-section>
        <q-item-section>
          <UnitField :value="block.data.inputValue" label="Measured" tag="big" readonly />
        </q-item-section>
        <q-item-section side>
          <q-icon :name="hasInputBlock ? 'mdi-pencil' : 'mdi-pencil-off'" />
        </q-item-section>
      </q-item>

      <q-separator inset />

      <q-item :clickable="hasOutputBlock" @click="showOutput">
        <q-tooltip v-if="hasOutputBlock">
          Edit {{ outputId }}
        </q-tooltip>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-mb-xs">
            Output
          </div>
        </q-item-section>
        <q-item-section>
          <ValueField :value="block.data.outputSetting" number label="Target" tag="big" />
        </q-item-section>
        <q-item-section>
          <ValueField :value="block.data.outputValue" number label="Measured" tag="big" />
        </q-item-section>
        <q-item-section side>
          <q-icon :name="hasOutputBlock ? 'mdi-pencil' : 'mdi-pencil-off'" />
        </q-item-section>
      </q-item>

      <q-separator inset />

      <q-item>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-my-xs">
            Result
          </div>
        </q-item-section>
        <q-item-section>
          <ValueField :value="block.data.p" label="P" number />
        </q-item-section>
        <q-item-section>
          <ValueField :value="block.data.i" label="I" number />
        </q-item-section>
        <q-item-section>
          <ValueField :value="block.data.d" label="D" number />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<style lang="stylus" scoped>
.q-card__section .q-separator {
  opacity: 0.2;
}
</style>
