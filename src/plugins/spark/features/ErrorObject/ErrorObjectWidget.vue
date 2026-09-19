<script setup lang="ts">
import { Block } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { useBlockWidget } from '@/plugins/spark/composables';

const { block } = useBlockWidget.setup<Block>();

const errorMessage = computed<string>(
  () =>
    block.value.data.error ?? 'The Spark service failed to decode this block.',
);

const rawData = computed<string>(() =>
  JSON.stringify(block.value.data, null, 2),
);
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar />
    </template>

    <div class="widget-body column">
      <CardWarning color="negative">
        <template #message>
          <div class="column q-gutter-y-sm">
            <div class="text-bold">
              The Spark service could not decode this block
              <template v-if="block.data.blockType">
                (type: {{ block.data.blockType }})
              </template>
            </div>
            <div class="monospace">
              {{ errorMessage }}
            </div>
            <div class="text-caption">
              This is usually caused by a version mismatch between the service
              and the firmware, or by a value the service could not convert.
              Check the service logs for details.
            </div>
          </div>
        </template>
      </CardWarning>

      <q-expansion-item
        label="Raw block data"
        dense
        header-class="text-subtitle2"
      >
        <pre class="q-pa-md monospace">{{ rawData }}</pre>
      </q-expansion-item>
    </div>
  </Card>
</template>

<style lang="sass" scoped>
.monospace
  white-space: pre-wrap
  font-family: monospace
  font-size: 0.9em
  overflow-x: auto
</style>
