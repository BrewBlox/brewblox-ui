<script setup lang="ts">
import {
  DEFAULT_METRICS_DECIMALS,
  DEFAULT_METRICS_EXPIRY,
} from '@/plugins/history/const';
import { defaultLabel } from '@/plugins/history/nodes';
import { fixedNumber, shortDateString } from '@/utils/quantity';
import { computed } from 'vue';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../blueprints/MetricsDisplay';
import { usePart } from '../composables';
import { useMetrics } from '../composables/use-metrics';
import { liquidBorderColor } from '../utils';

interface MetricDisplay {
  field: string;
  label: string;
  time: string;
  value: string;
  stale: boolean;
}

const { flows, metrics, width, height, bordered, passthrough } =
  usePart.setup();
const { source } = useMetrics.setupConsumer();

const color = computed<string>(() => liquidBorderColor(flows.value));

function fieldFreshDuration(field: string): number {
  return metrics.value.freshDuration[field] ?? DEFAULT_METRICS_EXPIRY;
}

const values = computed<MetricDisplay[]>(() => {
  if (!source.value) {
    return [];
  }
  const now = new Date().getTime();
  return source.value.values
    .filter((v) => metrics.value.fields.includes(v.field))
    .map((v) => ({
      field: v.field,
      label: metrics.value.renames[v.field] || defaultLabel(v.field),
      time: shortDateString(v.time),
      value: fixedNumber(
        v.value,
        metrics.value.decimals[v.field] ?? DEFAULT_METRICS_DECIMALS,
      ),
      stale:
        !!v.time && ((now - v.time) as number) > fieldFreshDuration(v.field),
    }));
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject v-bind="{ width, height }">
      <div class="full-width column q-py-xs">
        <div
          v-for="d in values"
          :key="d.field"
          class="column items-center full-width no-wrap"
        >
          <div
            class="col-auto text-small ellipsis q-px-sm"
            style="max-width: 100%"
          >
            {{ d.label }}
          </div>
          <div class="col-auto text-bold">{{ d.value }}</div>
        </div>
        <div
          v-if="!values.length"
          class="self-center q-pt-sm"
        >
          No metrics
        </div>
      </div>
    </foreignObject>
    <BuilderBorder
      v-if="bordered"
      v-bind="{ width, height, color }"
    />
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <MetricsMenuContent />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <ToggleMenuContent
            v-model="bordered"
            label="Border"
          />
          <ToggleMenuContent
            v-model="passthrough"
            label="Flow through part"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
