<script setup lang="ts">
import { Block, SetpointSensorPairBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { useSparkStore } from '@/plugins/spark/store';
import SetpointSensorPairBasic from './SetpointSensorPairBasic.vue';
import SetpointSensorPairFull from './SetpointSensorPairFull.vue';

const modes = {
  Basic: SetpointSensorPairBasic,
  Full: SetpointSensorPairFull,
} as const;

const { context, inDialog } = useContext.setup();
const sparkStore = useSparkStore();
const { serviceId, blockId } = useBlockWidget.setup<SetpointSensorPairBlock>();

const usedBy = computed<Block[]>(() => {
  return sparkStore
    .blocksByService(serviceId)
    .filter((b) => b.data.inputId?.id === blockId);
});

const formattedUsers = computed<string>(() =>
  usedBy.value.map((v) => `<i>${v.id}</i>`).join(' and '),
);

const enabledString = computed<string>(() => {
  if (usedBy.value.length > 0) {
    return `Setpoint is enabled and used by ${formattedUsers.value}.`;
  } else {
    return 'Setpoint is enabled and unused.';
  }
});

const disabledString = computed<string>(() => {
  if (usedBy.value.length > 0) {
    const verb = usedBy.value.length > 1 ? 'are' : 'is';
    return `Setpoint is disabled and therefore ${formattedUsers.value} ${verb} inactive.`;
  } else {
    return 'Setpoint is disabled and unused.';
  }
});
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <component :is="modes[context.mode]">
      <template #warnings>
        <BlockEnableToggle>
          <template #enabled>
            <span v-html="enabledString" />
          </template>
          <template #disabled>
            <span v-html="disabledString" />
          </template>
        </BlockEnableToggle>
      </template>
    </component>
  </PreviewCard>
</template>
