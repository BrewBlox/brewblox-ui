<script lang="ts">
import {
  DEFAULT_METRICS_DECIMALS,
  DEFAULT_METRICS_EXPIRY,
} from '@/plugins/history/const';
import { defaultLabel } from '@/plugins/history/nodes';
import { durationString, fixedNumber, shortDateString } from '@/utils/quantity';
import { computed, defineComponent, PropType } from 'vue';
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

    const dimensions = computed(() => ({
      x: 0,
      y: 0,
      width: coord2grid(sizeX.value),
      height: coord2grid(sizeY.value),
    }));

    const contentTransform = computed<string>(() =>
      textTransformation(props.part, [sizeX.value, sizeY.value]),
    );

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
      dimensions,
      contentTransform,
      color,
      bordered,
      values,
    };
  },
});
</script>

<template>
  <svg>
    <!-- <SvgEmbedded
      :transform="textTransformation(part, part.size, false)"
      :width="coord2grid(sizeX)"
      :height="coord2grid(sizeY)"
      class="column"
    >
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
    </SvgEmbedded> -->
    <g
      class="content"
      :width="dimensions.width"
      :height="dimensions.height"
    >
      <foreignObject
        :width="dimensions.width"
        :height="dimensions.height"
        :transform="contentTransform"
      >
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
    </g>
    <g class="outline">
      <rect
        v-show="bordered"
        :width="dimensions.width - 2"
        :height="dimensions.height - 2"
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
