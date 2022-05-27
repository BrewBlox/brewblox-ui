<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useSparkStore } from '@/plugins/spark/store';
import { BlockDriveChain } from '@/shared-types';
import { createBlockDialog } from '@/utils/dialog';

export default defineComponent({
  name: 'DrivenIndicator',
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    blockId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const sparkStore = useSparkStore();

    const driveChains = computed<BlockDriveChain[]>(() =>
      sparkStore
        .driveChainsByService(props.serviceId)
        .filter((chain) => chain.target === props.blockId),
    );

    const textChains = computed<string[][]>(() =>
      driveChains.value.map((chain) =>
        [...chain.intermediate, chain.source].map((id, idx) => {
          return idx === 0
            ? `Driven by <i>${id}</i>`
            : `&emsp; which is driven by <i>${id}</i>`;
        }),
      ),
    );

    const isDriven = computed<boolean>(() => textChains.value.length > 0);

    function showDialog(chainIdx: number): void {
      createBlockDialog({
        serviceId: props.serviceId,
        id: driveChains.value[chainIdx].source,
        type: null,
      });
    }

    return {
      driveChains,
      textChains,
      isDriven,
      showDialog,
    };
  },
});
</script>

<template>
  <q-list
    :class="[{ clickable: isDriven }]"
    class="rounded-borders"
  >
    <div
      v-for="(chain, chainIdx) in textChains"
      :key="chainIdx"
      class="col-auto q-pa-sm q-gutter-x-sm text-indigo-4 row"
      @click="showDialog(chainIdx)"
    >
      <q-tooltip>Edit {{ driveChains[chainIdx].source }}</q-tooltip>
      <q-icon
        name="mdi-fast-forward-outline"
        class="col-auto"
        size="sm"
      />
      <div class="col-auto">
        <div
          v-for="text in chain"
          :key="text"
        >
          <small
            class="darkish"
            v-html="text"
          />
        </div>
      </div>
    </div>
    <div
      v-if="!isDriven"
      class="col-auto q-pa-sm darkish text-italic"
    >
      <small>Not driven</small>
    </div>
  </q-list>
</template>
