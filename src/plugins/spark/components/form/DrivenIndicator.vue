<script lang="ts">
import { computed, defineComponent } from 'vue';

import { sparkStore } from '@/plugins/spark/store';
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
    const sparkModule = sparkStore.moduleById(props.serviceId)!;

    const driveChains = computed<string[][]>(
      () => sparkModule
        .drivenChains
        .filter(chain => chain[0] === props.blockId),
    );

    const textChains = computed<string[][]>(
      () => driveChains.value
        .map(chain => chain
          .slice(1)
          .map((id, idx) => {
            return idx === 0
              ? `Driven by <i>${id}</i>`
              : `&emsp; which is driven by <i>${id}</i>`;
          })),
    );

    const isDriven = computed<boolean>(
      () => textChains.value.length > 0,
    );

    function bossDriver(chainIdx: number): string {
      const chain = driveChains.value[chainIdx];
      return chain[chain.length - 1];
    }

    function showDialog(chainIdx: number): void {
      createBlockDialog({
        serviceId: props.serviceId,
        id: bossDriver(chainIdx),
        type: null,
      });
    }

    return {
      driveChains,
      textChains,
      isDriven,
      bossDriver,
      showDialog,
    };
  },
});
</script>

<template>
  <q-list :class="[{clickable: isDriven}]" class="rounded-borders">
    <div
      v-for="(chain, chainIdx) in textChains"
      :key="chainIdx"
      class="col-auto q-pa-sm q-gutter-x-sm text-indigo-4 row"
      @click="showDialog(chainIdx)"
    >
      <q-tooltip>Edit {{ bossDriver(chainIdx) }}</q-tooltip>
      <q-icon name="mdi-fast-forward-outline" class="col-auto" size="sm" />
      <div class="col-auto">
        <div v-for="text in chain" :key="text">
          <small class="darkish" v-html="text" />
        </div>
      </div>
    </div>
    <div v-if="!isDriven" class="col-auto q-pa-sm darkish text-italic">
      <small>Not driven</small>
    </div>
  </q-list>
</template>
