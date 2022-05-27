<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { DisplaySettingsBlock } from '@/plugins/spark/types';

import DisplaySettingsBasic from './DisplaySettingsBasic.vue';
import DisplaySettingsFull from './DisplaySettingsFull.vue';

export default defineComponent({
  name: 'DisplaySettingsWidget',
  components: {
    Basic: DisplaySettingsBasic,
    Full: DisplaySettingsFull,
  },
  setup() {
    const { context } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<DisplaySettingsBlock>();

    function clearSlots(): void {
      block.value.data.widgets = [];
      saveBlock();
    }

    return {
      context,
      clearSlots,
    };
  },
});
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

    <component :is="context.mode" />
  </Card>
</template>
