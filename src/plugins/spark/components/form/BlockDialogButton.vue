<script setup lang="ts">
import { Block } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useSparkStore } from '@/plugins/spark/store';
import { createBlockDialog } from '@/utils/block-dialog';

interface Props {
  blockId?: string | null;
  serviceId: string;
}

const props = withDefaults(defineProps<Props>(), {
  blockId: null,
});

const sparkStore = useSparkStore();

const block = computed<Block | null>(() =>
  sparkStore.blockById(props.serviceId, props.blockId),
);
</script>

<template>
  <q-btn
    :disable="!block"
    :icon="block ? 'mdi-pencil' : 'mdi-pencil-off'"
    @click="createBlockDialog(block)"
  >
    <slot />
  </q-btn>
</template>
