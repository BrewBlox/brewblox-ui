<script setup lang="ts">
import { useWidget } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { BlockWidget } from '@/plugins/spark/types';
import { computed } from 'vue';

interface AbsenceReason {
  message: string;
  temporary: boolean;
}

const { config } = useWidget.setup<BlockWidget>();
const sparkStore = useSparkStore();

const reason = computed<AbsenceReason>(() =>
  sparkStore.lastBlocksAtByService(config.value.serviceId)
    ? {
        message: `Block ${config.value.blockId} not found on service ${config.value.serviceId}`,
        temporary: false,
      }
    : {
        message: 'Waiting for service...',
        temporary: true,
      },
);

function fetch(): void {
  sparkStore.fetchAll(config.value.serviceId);
}
</script>

<template>
  <q-card>
    <WidgetToolbar>
      <template #actions>
        <ActionItem
          :disable="!reason.temporary"
          icon="refresh"
          label="Refresh"
          @click="fetch"
        />
      </template>
    </WidgetToolbar>

    <CardWarning color="negative">
      <template #message>
        <span>{{ reason.message }}</span>
      </template>
      <template
        v-if="reason.temporary"
        #actions
      >
        <q-spinner size="25px" />
      </template>
    </CardWarning>
  </q-card>
</template>
