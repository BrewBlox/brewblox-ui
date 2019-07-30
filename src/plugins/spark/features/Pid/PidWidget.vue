<script lang="ts">
import { Component } from 'vue-property-decorator';

import { showBlockDialog } from '@/helpers/dialog';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { sparkStore } from '@/plugins/spark/store';

import { startRelationsDialog } from './relations';
import { PidBlock } from './types';

@Component
export default class PidWidget extends BlockWidget {
  readonly block!: PidBlock;
  inputFormOpen = false;
  relationsOpen = false;

  get inputId() {
    return this.block.data.inputId.id;
  }

  get outputId() {
    return this.block.data.outputId.id;
  }

  get hasInputBlock() {
    return this.inputId
      && sparkStore
        .blockIds(this.serviceId)
        .includes(this.inputId);
  }

  get hasOutputBlock() {
    return this.outputId
      && sparkStore
        .blockIds(this.serviceId)
        .includes(this.outputId);
  }

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }

  showRelations() {
    startRelationsDialog(this.block);
  }

  showInput() {
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.inputId));
  }

  showOutput() {
    showBlockDialog(sparkStore.tryBlockById(this.serviceId, this.outputId));
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud">
      <template v-slot:actions>
        <ActionItem icon="mdi-ray-start-arrow" label="Show Relations" @click="showRelations" />
      </template>
    </BlockWidgetToolbar>

    <CardWarning v-if="!block.data.outputId.id">
      <template #message>PID has no output Block configured.</template>
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

    <q-card-section>
      <q-item :clickable="hasInputBlock" dark @click="showInput">
        <q-tooltip v-if="hasInputBlock">Edit {{ inputId }}</q-tooltip>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-mb-xs">Input</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Target</q-item-label>
          <UnitField :value="block.data.inputSetting" tag="big" readonly />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Measured</q-item-label>
          <UnitField :value="block.data.inputValue" tag="big" readonly />
        </q-item-section>
        <q-item-section side>
          <q-icon :name="hasInputBlock ? 'mdi-pencil' : 'mdi-pencil-off'" />
        </q-item-section>
      </q-item>

      <q-separator dark inset />

      <q-item :clickable="hasOutputBlock" dark @click="showOutput">
        <q-tooltip v-if="hasOutputBlock">Edit {{ outputId }}</q-tooltip>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-mb-xs">Output</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Target</q-item-label>
          <big>{{ block.data.outputSetting | round }}</big>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Measured</q-item-label>
          <big>{{ block.data.outputValue | round }}</big>
        </q-item-section>
        <q-item-section side>
          <q-icon :name="hasOutputBlock ? 'mdi-pencil' : 'mdi-pencil-off'" />
        </q-item-section>
      </q-item>

      <q-separator dark inset />

      <q-item dark>
        <q-item-section side class="col-3">
          <div class="text-weight-light text-subtitle2 q-my-xs">Result</div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>P</q-item-label>
          <span>{{ block.data.p | round }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>I</q-item-label>
          <span>{{ block.data.i | round }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>D</q-item-label>
          <span>{{ block.data.d | round }}</span>
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
