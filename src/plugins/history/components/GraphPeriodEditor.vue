<script lang="ts">
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import matches from 'lodash/matches';
import { computed, defineComponent, PropType, ref, watch } from 'vue';

import { durationMs, durationString } from '@/utils/quantity';

import { QueryConfig, QueryParams } from '../types';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

const periodOptions: SelectOption[] = [
  {
    label: 'Live: [duration] to now',
    value: { start: false, duration: true, end: false },
  },
  {
    label: 'Live: from [date] to now',
    value: { start: true, duration: false, end: false },
  },
  {
    label: 'Fixed: [duration] to [date]',
    value: { start: false, duration: true, end: true },
  },
  {
    label: 'Fixed: [duration] since [date]',
    value: { start: true, duration: true, end: false },
  },
  {
    label: 'Fixed: from [date] to [date]',
    value: { start: true, duration: false, end: true },
  },
];

const paramDefaults = (): QueryParams => ({
  start: new Date().getTime() - durationMs('1d'),
  duration: '1d',
  end: new Date().getTime(),
});

export default defineComponent({
  name: 'GraphPeriodEditor',
  props: {
    config: {
      type: Object as PropType<QueryConfig>,
      required: true,
    },
    downsampling: {
      type: Object as PropType<Mapped<string>>,
      default: () => ({}),
    },
  },
  emits: ['update:config'],
  setup(props, { emit }) {
    const local = ref({ ...props.config });
    const period = ref(makePeriod(props.config.params));

    watch(
      () => props.config.params,
      params => { period.value = makePeriod(params); },
    );

    function makePeriod(params: QueryParams): PeriodDisplay {
      const period: PeriodDisplay = {
        start: params?.start !== undefined,
        duration: params?.duration !== undefined,
        end: params?.end !== undefined,
      };
      const opts = periodOptions.map(opt => opt.value);
      const matching = opts.some(v => isEqual(v, period));
      return matching ? period : opts[0];
    }

    function saveConfig(config: QueryConfig): void {
      emit('update:config', config);
    }

    function saveSanitized(period: PeriodDisplay): void {
      const defaults = paramDefaults();
      const { params } = local.value;
      local.value.params = {
        ...params,
        start: !period.start ? undefined : (params.start ?? defaults.start),
        duration: !period.duration ? undefined : (params.duration ?? defaults.duration),
        end: !period.end ? undefined : (params.end ?? defaults.end),
      };
      saveConfig(local.value);
    }

    const isLive = computed<boolean>(
      () => {
        const opt = find(periodOptions, matches({ value: period.value }));
        return opt !== undefined && opt.label.startsWith('Live');
      },
    );

    function saveStart(val: number): void {
      local.value.params.start = val;
      saveSanitized(period.value);
    }

    function saveDuration(val: string): void {
      local.value.params.duration = durationString(val || '10m');
      saveSanitized(period.value);
    }

    function saveEnd(val: number): void {
      local.value.params.end = val;
      saveSanitized(period.value);
    }

    return {
      periodOptions,
      period,
      isLive,
      saveStart,
      saveDuration,
      saveEnd,
      saveSanitized,
    };
  },
});
</script>

<template>
  <div class="widget-body row">
    <q-select
      :model-value="period"
      :options="periodOptions"
      emit-value
      map-options
      label="Time period"
      class="col-auto"
      @update:model-value="saveSanitized"
    >
      <template #append>
        <q-icon name="mdi-chart-timeline" size="sm">
          <q-tooltip>
            <i>To improve performance, the history service automatically selects an averaging period.</i> <br>
            <i>One point is returned per period, with the average value of all points in that period.</i> <br>
            <div class="row q-mt-sm">
              <LabeledField
                v-for="(rate, meas) in downsampling"
                :key="meas"
                :model-value="rate"
                :label="meas"
                item-aligned
                class="col"
              />
            </div>
          </q-tooltip>
        </q-icon>
      </template>
    </q-select>
    <div class="col-auto row q-gutter-x-sm q-ml-none">
      <DatetimeField
        v-if="period.start"
        :model-value="config.params.start"
        emit-number
        title="Start time"
        label="Start date and time"
        class="col-auto min-width-sm"
        @update:model-value="saveStart"
      />
      <DurationField
        v-if="period.duration"
        :model-value="config.params.duration"
        title="Duration"
        label="Duration"
        class="col-auto min-width-sm"
        @update:model-value="saveDuration"
      />
      <DatetimeField
        v-if="period.end"
        :model-value="config.params.end"
        emit-number
        title="End time"
        label="End date and time"
        class="col-auto min-width-sm"
        @update:model-value="saveEnd"
      />
      <LabeledField
        v-if="isLive"
        label="End time"
        class="col-auto text-italic"
      >
        Graph is live
      </LabeledField>
    </div>
  </div>
</template>
