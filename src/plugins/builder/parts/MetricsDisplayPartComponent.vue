<script lang="ts">
import {
  DEFAULT_METRICS_DECIMALS,
  DEFAULT_METRICS_EXPIRY,
} from '@/plugins/history/const';
import { defaultLabel } from '@/plugins/history/nodes';
import { fixedNumber, shortDateString } from '@/utils/quantity';
import { computed, defineComponent } from 'vue';
import { usePart } from '../composables';
import { useMetrics } from '../composables/use-metrics';
import { CENTER } from '../const';
import { liquidOnCoord } from '../utils';

interface MetricDisplay {
  field: string;
  label: string;
  time: string;
  value: string;
  stale: boolean;
}

export default defineComponent({
  name: 'MetricsDisplayPartComponent',
  setup() {
    const { part, metrics, width, height, bordered } = usePart.setup();
    const { source } = useMetrics.setup(null);

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
            !!v.time &&
            ((now - v.time) as number) > fieldFreshDuration(v.field),
        }));
    });

    const color = computed<string>(
      () => liquidOnCoord(part.value, CENTER)[0] ?? '',
    );

    return {
      width,
      height,
      bordered,
      color,
      values,
    };
  },
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <foreignObject class="fit">
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
    <g class="outline">
      <rect
        v-show="bordered"
        :width="width - 2"
        :height="height - 2"
        :stroke="color"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </svg>
</template>
