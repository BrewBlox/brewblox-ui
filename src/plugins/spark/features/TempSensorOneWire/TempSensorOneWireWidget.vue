<script setup lang="ts">
import TempSensorSwapDialog from './TempSensorSwapDialog.vue';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';
import { createComponentDialog } from '@/utils/dialog';
import { TempSensorOneWireBlock } from 'brewblox-proto/ts';
import { computed } from 'vue';

const { context, inDialog } = useContext.setup();
const { serviceId, blockId, block, patchBlock } =
  useBlockWidget.setup<TempSensorOneWireBlock>();

const hasValue = computed<boolean>(() => block.value.data.value.value !== null);

function startSwap(): void {
  createComponentDialog({
    component: TempSensorSwapDialog,
    componentProps: {
      serviceId,
      leftId: blockId,
    },
  });
}
</script>

<template>
  <PreviewCard :enabled="inDialog">
    <template #preview>
      <BlockHistoryGraph />
    </template>

    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle>
        <template #actions>
          <ActionItem
            icon="mdi-swap-horizontal"
            label="Swap OneWire address"
            @click="startSwap"
          />
        </template>
      </BlockWidgetToolbar>
    </template>

    <div>
      <CardWarning v-if="!hasValue">
        <template #message> OneWire Sensor could not be read. </template>
      </CardWarning>

      <div class="q-ma-md row justify-center">
        <div
          v-if="hasValue"
          class="col-auto row items-center"
        >
          <q-icon
            name="mdi-thermometer"
            size="md"
            color="green-3"
            class="col-auto"
          />
          <QuantityField
            :model-value="block.data.value"
            readonly
            tag="big"
            class="col-auto"
          />
        </div>
      </div>

      <template v-if="context.mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <QuantityField
            :model-value="block.data.offset"
            title="Offset"
            label="Offset"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ offset: v })"
          />
          <TextField
            :model-value="block.data.address"
            title="Address"
            label="Address"
            class="col-grow"
            @update:model-value="(v) => patchBlock({ address: v })"
          />
        </div>
      </template>
    </div>
  </PreviewCard>
</template>
