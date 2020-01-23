<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { getMutexClients, MutexBlocks } from './getters';
import { MutexBlock } from './types';

@Component
export default class MutexBasic
  extends BlockCrudComponent<MutexBlock> {

  get mutexClients(): MutexBlocks {
    return getMutexClients(this.serviceId, this.blockId);
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row items-start">
      <LabeledField
        label="Held by"
        class="col-grow min-width-sm"
      >
        <div v-for="client in mutexClients.active" :key="client">
          {{ client }}
        </div>
        <div v-if="mutexClients.active.length === 0">
          --
        </div>
      </LabeledField>
      <div
        class="col-grow column min-width-sm"
      >
        <LabeledField label="Waiting">
          <div v-for="client in mutexClients.waiting" :key="client">
            {{ client }}
          </div>
          <div v-if="mutexClients.waiting.length === 0">
            --
          </div>
        </LabeledField>
        <LabeledField label="Wait time remaining">
          <div v-if="mutexClients.waiting.length > 0 && block.data.waitRemaining.value">
            {{ block.data.waitRemaining | unitDuration }}
          </div>
          <div v-else>
            --
          </div>
        </LabeledField>
      </div>
      <LabeledField
        label="Idle"
        class="col-grow min-width-sm"
      >
        <div v-for="client in mutexClients.idle" :key="client">
          {{ client }}
        </div>
        <div v-if="mutexClients.idle.length === 0">
          --
        </div>
      </LabeledField>
    </div>
  </div>
</template>
