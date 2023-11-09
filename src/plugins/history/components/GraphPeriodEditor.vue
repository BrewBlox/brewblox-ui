<script setup lang="ts" generic="T extends QueryConfig">
import { QueryConfig, QueryParams } from '../types';
import {
  bloxQty,
  durationMs,
  durationString,
  parseDate,
} from '@/utils/quantity';
import { Quantity } from 'brewblox-proto/ts';
import { produce } from 'immer';
import isEqual from 'lodash/isEqual';
import { date as dateUtil } from 'quasar';
import { computed, toRaw } from 'vue';

interface Props {
  config: T;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:config': [payload: T];
}>();

/**
 * Any given time span is expressed using one or two
 * of the below properties.
 * If only `start` or `duration` is given, the span is considered "live",
 * with `end` moving with current time.
 */
interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

const periodOptions: SelectOption<PeriodDisplay>[] = [
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

function update(cb: (draft: T) => void | T): void {
  const updated = produce(toRaw(props.config), cb);
  emit('update:config', updated);
}

function inferPeriod(params: QueryParams): PeriodDisplay {
  const period: PeriodDisplay = {
    start: params?.start != null,
    duration: params?.duration != null,
    end: params?.end != null,
  };
  const opts = periodOptions.map((opt) => opt.value);
  const matching = opts.some((v) => isEqual(v, period));
  return matching ? period : opts[0];
}

/**
 * Ensures the shape of the query params object matches the desired period.
 *
 * Adds default properties where required and not yet set.
 * Properties that were set, but are no longer relevant, are set to undefined.
 *
 * @param draft
 * @param period
 */
function sanitize(draft: T, period: PeriodDisplay): void {
  const defaults = paramDefaults();
  const { start, duration, end } = draft.params;
  const startValue = start ?? defaults.start;
  const durationValue = duration ?? defaults.duration;
  const endValue = end ?? defaults.end;

  draft.params.start = period.start ? startValue : undefined;
  draft.params.duration = period.duration ? durationValue : undefined;
  draft.params.end = period.end ? endValue : undefined;
}

const period = computed<PeriodDisplay>({
  get: () => inferPeriod(props.config.params),
  set: (v) =>
    update((draft) => {
      // We can retain params from the previously selected
      sanitize(draft, v ?? periodOptions[0].value);
    }),
});

const isLive = computed<boolean>(() => {
  return Object.values(period.value).filter((v) => v).length === 1;
});

const start = computed<Date | null>({
  get: () => parseDate(props.config.params.start),
  set: (v) =>
    update((draft) => {
      draft.params.start = v ? v.toISOString() : undefined;
      sanitize(draft, period.value);
    }),
});

const duration = computed<Quantity>({
  get: () => bloxQty(props.config.params.duration ?? ''),
  set: (v) =>
    update((draft) => {
      const ms = durationMs(v);
      draft.params.duration = durationString(ms || '10m');
      sanitize(draft, period.value);
    }),
});

const end = computed<Date | null>({
  get: () => parseDate(props.config.params.end),
  set: (v) =>
    update((draft) => {
      draft.params.end = v ? v.toISOString() : undefined;
      sanitize(draft, period.value);
    }),
});
</script>

<template>
  <div class="row">
    <q-select
      v-model="period"
      :options="periodOptions"
      emit-value
      map-options
      label="Time period"
      class="col-auto"
    />
    <div class="col-auto row q-gutter-x-sm q-mt-sm q-ml-none">
      <DatetimeField
        v-if="period.start"
        v-model="start"
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
