<script setup lang="ts">
import DisplaySettingsBasic from './DisplaySettingsBasic.vue';
import DisplaySettingsFull from './DisplaySettingsFull.vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { DisplaySettingsBlock } from 'brewblox-proto/ts';

const modes = {
  Basic: DisplaySettingsBasic,
  Full: DisplaySettingsFull,
} as const;

const { context } = useContext.setup();
const { patchBlock } = useBlockWidget.setup<DisplaySettingsBlock>();

function clearSlots(): void {
  patchBlock({ widgets: [] });
}
</script>

<template>
  <Card size="lg">
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem
            icon="clear"
            label="Clear slots"
            @click="clearSlots"
          />
        </template>
      </BlockWidgetToolbar>
    </template>

    <component :is="modes[context.mode]" />
  </Card>
</template>
