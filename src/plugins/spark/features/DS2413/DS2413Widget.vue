<script setup lang="ts">
import { DS2413Block } from 'brewblox-proto/ts';
import { useContext } from '@/composables';
import { useBlockWidget } from '@/plugins/spark/composables';

const { context } = useContext.setup();
const { block, patchBlock } = useBlockWidget.setup<DS2413Block>();
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <div>
      <CardWarning v-if="!block.data.connected">
        <template #message> DS2413 is not connected </template>
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
  </Card>
</template>
