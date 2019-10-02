<script lang="ts">
import { Component } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { sparkStore } from '@/plugins/spark/store';

import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component
export default class PidWidget extends BlockWidgetBase {
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

  get cardComponent(): string {
    return this.context.mode === 'Basic'
      ? 'PidCardBasic'
      : 'PidCardFull';
  }

  get toolbarComponent(): string {
    return this.context.container === 'Dialog'
      ? 'BlockFormToolbar'
      : 'BlockWidgetToolbar';
  }

  get renderClass(): string[] {
    return this.context.container === 'Dialog'
      ? ['widget-modal']
      : ['text-white', 'scroll', 'widget-dashboard'];
  }

  get wrapped(): boolean {
    return this.context.container === 'Dialog';
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
  <GraphCardWrapper :show="wrapped">
    <template #graph>
      <HistoryGraph :id="widget.id" :config="graphCfg" />
    </template>
    <component :is="cardComponent" :crud="crud" :class="renderClass">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud">
          <template v-slot:actions>
            <ActionItem
              icon="mdi-ray-start-arrow"
              label="Show Relations"
              @click="showRelations"
            />
          </template>
        </component>
      </template>
      <template #warnings>
        <CardWarning v-if="!block.data.outputId.id">
          <template #message>
            PID has no output Block configured.
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.enabled">
          <template #message>
            <span>
              PID is disabled:
              <i>{{ block.data.outputId }}</i> will not be set.
            </span>
          </template>
          <template #actions>
            <q-btn text-color="white" flat label="Enable" @click="enable" />
          </template>
        </CardWarning>

        <CardWarning v-else-if="!block.data.active">
          <template #message>
            <span>
              PID is inactive:
              <i>{{ block.data.outputId }}</i> will not be set.
            </span>
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
