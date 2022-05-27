<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';

import {
  DEFAULT_METRICS_DECIMALS,
  DEFAULT_METRICS_EXPIRY,
} from '@/plugins/history/const';
import { defaultLabel } from '@/plugins/history/nodes';
import { fixedNumber, shortDateString } from '@/utils/formatting';
import { durationString } from '@/utils/quantity';

import { usePart } from '../composables';
import { useMetrics } from '../composables/use-metrics';
import { CENTER } from '../const';
import { FlowPart } from '../types';
import { coord2grid, liquidOnCoord, textTransformation } from '../utils';

interface MetricDisplay {
  field: string;
  label: string;
  time: string;
  value: string;
  stale: boolean;
}

export default defineComponent({
  name: 'MetricsDisplayPartComponent',
  props: {
    part: {
      type: Object as PropType<FlowPart>,
      required: true,
    },
  },
  setup(props) {
    const { source } = useMetrics.setup(null);
    const { sizeX, sizeY, bordered } = usePart.setup(props.part);

    function fieldFreshDuration(field: string): number {
      return props.part.metrics?.freshDuration[field] ?? DEFAULT_METRICS_EXPIRY;
    }

    const values = computed<MetricDisplay[]>(() => {
      const { metrics } = props.part;
      if (!metrics || !source.value) {
        return [];
      }
      const now = new Date().getTime();
      return source.value.values
        .filter((v) => metrics.fields.includes(v.field))
        .map((v) => ({
          field: v.field,
          label: metrics.renames[v.field] || defaultLabel(v.field),
          time: shortDateString(v.time),
          value: fixedNumber(
            v.value,
            metrics.decimals[v.field] ?? DEFAULT_METRICS_DECIMALS,
          ),
          stale:
            !!v.time &&
            ((now - v.time) as number) > fieldFreshDuration(v.field),
        }));
    });

    const color = computed<string>(
      () => liquidOnCoord(props.part, CENTER)[0] ?? '',
    );

    return {
      durationString,
      textTransformation,
      coord2grid,
      sizeX,
      sizeY,
      color,
      bordered,
      values,
    };
  },
});
</script>

<template>
  <g>
    <SvgEmbedded
      :transform="textTransformation(part, part.size, false)"
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
      class="column"
    >
      <div class="full-width column">
        <LabeledField
          v-for="d in values"
          :key="d.field"
          :label="d.label"
          class="col-auto min-width-md"
          :tag-class="{ 'text-strike': d.stale }"
          dense
        >
          {{ d.value }}
        </LabeledField>
        <div
          v-if="!values.length"
          class="self-center q-pt-sm"
        >
          No metrics
        </div>
      </div>
    </SvgEmbedded>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="coord2grid(sizeX) - 2"
        :height="coord2grid(sizeY) - 2"
        :stroke="color"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
