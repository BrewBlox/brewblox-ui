<script lang="ts">
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { durationString } from '@/utils/quantity';
import { MutexBlock, MutexedConstraint } from 'brewblox-proto/ts';
import { computed, defineComponent } from 'vue';

interface MutexClient extends MutexedConstraint {
  id: string;
}

export default defineComponent({
  name: 'MutexBasic',
  setup() {
    const sparkStore = useSparkStore();
    const { serviceId, block } = useBlockWidget.setup<MutexBlock>();

    const mutexClients = computed<MutexClient[]>(() =>
      sparkStore
        .blocksByService(serviceId)
        .filter((b) => {
          const mutexed: MutexedConstraint | undefined =
            b.data.constraints?.mutexed;
          return mutexed?.enabled && mutexed?.mutexId.id === block.value.id;
        })
        .map((b) => ({
          ...b.data.constraints?.mutexed,
          id: b.id,
        })),
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
          v-for="{ id, limiting, hasLock } in mutexClients"
          :key="id"
          :class="[
            'q-px-sm q-py-xs',
            limiting && 'text-orange',
            hasLock && 'text-green',
          ]"
        >
          <q-icon
            v-if="hasLock"
            name="mdi-lock"
          />
          <q-icon
            v-else
            name=""
          />
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
