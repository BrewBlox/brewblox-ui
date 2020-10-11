<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { MutexBlock, MutexedConstraint } from '@/plugins/spark/types';
import { Unit } from '@/plugins/spark/units';

interface MutexClient {
  id: string;
  remaining: Unit;
  limited: boolean;
  hasLock: boolean;
}

@Component
export default class MutexBasic
  extends BlockCrudComponent<MutexBlock> {

  get mutexClients(): MutexClient[] {
    return this.sparkModule.blocks
      // Does the block have -any- digital constraint?
      .filter(block => block.data.constrainedBy?.constraints[0]?.remaining)
      .flatMap(block => {
        // Cast to MutexedConstraint for typing reasons
        // We haven't yet checked whether this is actually true
        const constraints: MutexedConstraint[] = block.data.constrainedBy.constraints;
        return constraints
          // Is this a mutexed constraint?
          // Is this mutexed constraint using this Mutex block?
          .filter(c => c.mutexed?.mutexId.id === this.blockId)
          .map(c => ({
            id: block.id,
            remaining: c.remaining,
            limited: !!c.remaining.value,
            hasLock: c.mutexed.hasLock,
          }));
      });
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row items-start">
      <LabeledField
        label="Clients"
        class="col-grow"
      >
        <div
          v-for="{id, remaining, limited, hasLock} in mutexClients"
          :key="id"
          :class="[
            'q-px-sm q-py-xs',
            limited && 'text-orange',
            hasLock && 'text-green',
          ]"
        >
          <q-icon v-if="hasLock" name="mdi-lock" />
          <q-icon v-else name="" />
          {{ id }}
        </div>
      </LabeledField>
      <LabeledField
        label="Lock time remaining"
        class="col-grow"
      >
        {{ block.data.waitRemaining }}
      </LabeledField>
    </div>
  </div>
</template>
