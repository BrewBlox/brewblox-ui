<script lang="ts">
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import matches from 'lodash/matches';
import { date as dateUtil } from 'quasar';
import { PropType, computed, defineComponent, ref, watch } from 'vue';

import { durationString, parseDate } from '@/utils/quantity';

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
  start: dateUtil.subtractFromDate(new Date(), { days: 1 }).toISOString(),
  duration: '1d',
  end: new Date().toISOString(),
});

export default defineComponent({
  name: 'GraphPeriodEditor',
  props: {
    config: {
      type: Object as PropType<QueryConfig>,
      required: true,
    },
  },
  emits: ['update:config'],
  setup(props, { emit }) {
    const local = ref({ ...props.config });
    const period = ref(makePeriod(props.config.params));

    watch(
      () => props.config.params,
      (params) => {
        period.value = makePeriod(params);
      },
    );

    function makePeriod(params: QueryParams): PeriodDisplay {
      const period: PeriodDisplay = {
        start: params?.start !== undefined,
        duration: params?.duration !== undefined,
        end: params?.end !== undefined,
      };
      const opts = periodOptions.map((opt) => opt.value);
      const matching = opts.some((v) => isEqual(v, period));
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
        start: !period.start ? undefined : params.start ?? defaults.start,
        duration: !period.duration
          ? undefined
          : params.duration ?? defaults.duration,
        end: !period.end ? undefined : params.end ?? defaults.end,
      };
      saveConfig(local.value);
    }

    const isLive = computed<boolean>(() => {
      const opt = find(periodOptions, matches({ value: period.value }));
      return opt !== undefined && opt.label.startsWith('Live');
    });

    const start = computed<Date | null>({
      get: () => parseDate(props.config.params.start),
      set: (v) => {
        local.value.params.start = v ? v.toISOString() : undefined;
        saveSanitized(period.value);
      },
    });

    const duration = computed<string>({
      get: () => props.config.params.duration ?? '',
      set: (v) => {
        local.value.params.duration = durationString(v || '10m');
        saveSanitized(period.value);
      },
    });

    const end = computed<Date | null>({
      get: () => parseDate(props.config.params.end),
      set: (v) => {
        local.value.params.end = v ? v.toISOString() : undefined;
        saveSanitized(period.value);
      },
    });

    return {
      periodOptions,
      period,
      isLive,
      start,
      duration,
      end,
      saveSanitized,
    };
  },
});
</script>

<template>
  <div class="row">
    <q-select
      :model-value="period"
      :options="periodOptions"
      emit-value
      map-options
      label="Time period"
      class="col-auto"
      @update:model-value="saveSanitized"
    />
    <div class="col-auto row q-gutter-x-sm q-mt-sm q-ml-none">
      <DatetimeField
        v-if="period.start"
        v-model="start"
        emit-number
        title="Start time"
        label="Start date and time"
        class="col-auto min-width-sm"
      />
      <DurationField
        v-if="period.duration"
        v-model="duration"
        title="Duration"
        label="Duration"
        class="col-auto min-width-sm"
      />
      <DatetimeField
        v-if="period.end"
        v-model="end"
        emit-number
        title="End time"
        label="End date and time"
        class="col-auto min-width-sm"
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
