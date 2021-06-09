<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useBlockWidget } from '@/plugins/spark/composables';
import { MutexBlock, MutexedConstraint, Quantity } from '@/plugins/spark/types';
import { durationString } from '@/utils/duration';

interface MutexClient {
  id: string;
  remaining: Quantity;
  limited: boolean;
  hasLock: boolean;
}

export default defineComponent({
  name: 'MutexBasic',
  setup() {
    const {
      sparkModule,
      block,
    } = useBlockWidget.setup<MutexBlock>();

    const mutexClients = computed<MutexClient[]>(
      () => sparkModule.blocks
        // Does the block have -any- digital constraint?
        .filter(b => b.data.constrainedBy?.constraints[0]?.remaining)
        .flatMap(b => {
          // Cast to MutexedConstraint for typing reasons
          // We haven't yet checked whether this is actually true
          const constraints: MutexedConstraint[] = b.data.constrainedBy.constraints;
          return constraints
            // Is this a mutexed constraint?
            // Is this mutexed constraint using this Mutex block?
            .filter(c => c.mutexed?.mutexId.id === block.value.id)
            .map(c => ({
              id: b.id,
              remaining: c.remaining,
              limited: !!c.remaining.value,
              hasLock: c.mutexed.hasLock,
            }));
        }),
    );

    return {
      durationString,
      block,
      mutexClients,
    };
  },
});
</script>

<template>
  <div>
    <slot name="warnings" />

    <div class="widget-body row items-start">
      <LabeledField
        label="Clients"
        class="col-grow"
      >
        <div
          v-for="{id, limited, hasLock} in mutexClients"
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
        {{ durationString(block.data.waitRemaining) }}
      </LabeledField>
    </div>
  </div>
</template>
