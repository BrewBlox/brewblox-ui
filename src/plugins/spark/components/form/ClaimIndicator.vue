<script setup lang="ts">
import { BlockClaim } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';

interface Props {
  serviceId: string;
  blockId: string;
}

const props = defineProps<Props>();

const sparkStore = useSparkStore();

const claim = computed<BlockClaim | undefined>(() =>
  sparkStore
    .claimsByService(props.serviceId)
    .find((c) => c.target === props.blockId),
);

function showBlockById(id: string): void {
  createBlockDialog(
    { serviceId: props.serviceId, id, type: null },
    { mode: 'Basic' },
  );
}
</script>

<template>
  <div
    v-if="claim"
    class="q-pa-sm q-gutter-y-xs text-indigo-4"
  >
    <div class="row">
      <div
        class="col-auto rounded-borders clickable q-px-sm q-py-xs"
        @click="showBlockById(claim!.source)"
      >
        <i>{{ claim.source }}</i>
      </div>
    </div>
    <div
      v-for="(id, idx) in claim.intermediate"
      :key="'intermediate-' + id"
      :style="`margin-left: ${idx * 5}px`"
      class="row"
    >
      <q-icon
        name="mdi-keyboard-return"
        style="transform: scale(-1, 1)"
        class="q-pa-sm"
      />
      <div
        class="col-auto rounded-borders clickable q-px-sm q-py-xs"
        @click="showBlockById(id)"
      >
        <i>{{ id }}</i>
      </div>
    </div>
    <div
      :style="`margin-left: ${claim.intermediate.length * 5}px`"
      class="row"
    >
      <q-icon
        name="mdi-keyboard-return"
        style="transform: scale(-1, 1)"
        class="q-pa-sm"
      />
      <div class="col-auto q-py-xs">This block</div>
    </div>
  </div>
  <div
    v-else
    class="col-auto q-pa-sm darkish text-italic text-small"
  >
    Not claimed
  </div>
</template>
