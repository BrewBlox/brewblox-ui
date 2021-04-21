<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { DS2413Block } from '@/plugins/spark/types';

export default defineComponent({
  name: 'DS2413Widget',
  setup() {
    const { context } = useContext.setup();
    const {
      block,
      saveBlock,
    } = useBlockWidget.setup<DS2413Block>();

    return {
      context,
      block,
      saveBlock,
    };
  },
});
</script>

<template>
  <CardWrapper>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!block.data.connected">
        <template #message>
          DS2413 is not connected
        </template>
      </CardWarning>
      <IoArray />

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <LabeledField
            :model-value="block.data.connected ? 'Yes' : 'No'"
            label="Connected"
            class="col-grow"
          />
          <InputField
            :model-value="block.data.address"
            title="Address"
            label="Address"
            class="col-grow"
            @update:model-value="v => { block.data.address = v; saveBlock(); }"
          />
        </div>
      </template>
    </div>
  </CardWrapper>
</template>
