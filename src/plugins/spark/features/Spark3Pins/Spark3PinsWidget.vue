<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { Spark3PinsBlock } from '@/plugins/spark/types';
import { fixedNumber } from '@/utils/formatting';

export default defineComponent({
  name: 'Spark3PinsWidget',
  setup() {
    const { context } = useContext.setup();
    const { block, saveBlock } = useBlockWidget.setup<Spark3PinsBlock>();
    return {
      fixedNumber,
      context,
      block,
      saveBlock,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <IoArray />

      <div v-if="context.mode === 'Full'" class="widget-body row">
        <q-separator inset />
        <div class="col-break" />

        <LabeledField
          label="Enable 5V"
          class="col-grow"
        >
          <q-toggle
            :model-value="block.data.enableIoSupply5V"
            dense
            @update:model-value="v => { block.data.enableIoSupply5V = v; saveBlock(); }"
          />
        </labeledfield>
        <LabeledField
          label="Enable 12V"
          class="col-grow"
        >
          <q-toggle
            :model-value="block.data.enableIoSupply12V"
            dense
            @update:model-value="v => { block.data.enableIoSupply12V = v; saveBlock(); }"
          />
        </LabeledField>

        <div class="col-break" />

        <LabeledField
          label="5V Voltage"
          class="col-grow"
        >
          {{ fixedNumber(block.data.voltage5) }}
        </LabeledField>
        <LabeledField
          label="12V Voltage"
          class="col-grow"
        >
          {{ fixedNumber(block.data.voltage12) }}
        </LabeledField>
      </div>
    </div>
  </Card>
</template>
