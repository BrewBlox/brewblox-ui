<script setup lang="ts">
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { fixedNumber } from '@/utils/quantity';
import { Spark3PinsBlock } from 'brewblox-proto/ts';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Spark3PinsWidget',
  setup() {
    const { context } = useContext.setup();
    const { block, patchBlock } = useBlockWidget.setup<Spark3PinsBlock>();

    return {
      fixedNumber,
      context,
      block,
      patchBlock,
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

      <div
        v-if="context.mode === 'Full'"
        class="widget-body row"
      >
        <q-separator inset />
        <div class="col-break" />

        <LabeledField
          label="Enable 5V"
          class="col-grow"
        >
          <q-toggle
            :model-value="block.data.enableIoSupply5V"
            dense
            @update:model-value="(v) => patchBlock({ enableIoSupply5V: v })"
          />
        </LabeledField>
        <LabeledField
          label="Enable 12V"
          class="col-grow"
        >
          <q-toggle
            :model-value="block.data.enableIoSupply12V"
            dense
            @update:model-value="(v) => patchBlock({ enableIoSupply12V: v })"
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
