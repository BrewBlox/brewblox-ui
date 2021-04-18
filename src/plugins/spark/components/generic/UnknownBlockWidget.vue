<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useWidget } from '@/composables';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockConfig } from '@/plugins/spark/types';

interface AbsenceReason {
  message: string;
  temporary: boolean;
}

export default defineComponent({
  name: 'UnknownBlockWidget',
  setup() {
    const {
      widget,
    } = useWidget.setup<BlockConfig>();

    const config = computed<BlockConfig>(
      () => widget.value.config,
    );

    const sparkModule = computed<SparkServiceModule>(
      () => sparkStore.moduleById(config.value.serviceId)!,
    );

    const reason = computed<AbsenceReason>(
      () => sparkModule.value.lastBlocks
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
      sparkModule.value.fetchAll();
    }

    return {
      reason,
      fetch,
    };
  },
});
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
      <template v-if="reason.temporary" #actions>
        <q-spinner size="25px" />
      </template>
    </CardWarning>
  </q-card>
</template>
