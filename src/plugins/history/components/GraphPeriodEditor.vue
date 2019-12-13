<script lang="ts">
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import matches from 'lodash/matches';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { durationMs, durationString } from '@/helpers/functional';

import { QueryConfig, QueryParams } from '../types';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphPeriodEditor extends Vue {
  periodOptions: SelectOption[] = [
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

  period: PeriodDisplay | null = null;

  @Prop({ type: Object, default: () => ({}) })
  readonly downsampling!: Mapped<string>;

  @Prop({ type: Object, required: true })
  public readonly config!: QueryConfig;

  @Watch('config.params', { immediate: true })
  watchParams(params: QueryParams): void {
    const period: PeriodDisplay = {
      start: params?.start !== undefined,
      duration: params?.duration !== undefined,
      end: params?.end !== undefined,
    };
    const opts = this.periodOptions.map(opt => opt.value);
    const matching = opts.some(v => isEqual(v, period));
    this.period = matching ? period : opts[0];
  }

  saveConfig(config: QueryConfig = this.config): void {
    this.$emit('update:config', config);
  }

  paramDefaults(): QueryParams {
    return {
      start: new Date().getTime() - durationMs('1d'),
      duration: '1d',
      end: new Date().getTime(),
    };
  }

  get shownPeriod(): PeriodDisplay {
    return this.period ?? this.periodOptions[0].value;
  }

  saveSanitized(period: PeriodDisplay = this.shownPeriod): void {
    const defaults = this.paramDefaults();
    const current = this.config.params;
    this.config.params = {
      ...this.config.params,
      start: !period.start ? undefined : (current.start ?? defaults.start),
      duration: !period.duration ? undefined : (current.duration ?? defaults.duration),
      end: !period.end ? undefined : (current.end ?? defaults.end),
    };
    this.saveConfig();
  }

  get isLive(): boolean {
    const opt = find(this.periodOptions, matches({ value: this.shownPeriod }));
    return opt !== undefined && opt.label.startsWith('Live');
  }

  saveShownPeriod(period: PeriodDisplay): void {
    this.saveSanitized(period);
  }

  saveStart(val: Date): void {
    this.config.params.start = val.getTime();
    this.saveSanitized();
  }

  saveDuration(val: string): void {
    this.config.params.duration = durationString(val || '10m');
    this.saveSanitized();
  }

  saveEnd(val: Date): void {
    this.config.params.end = val.getTime();
    this.saveSanitized();
  }
}
</script>

<template>
  <div class="row wrap q-mx-sm q-pb-md" style="border-bottom: 1px solid grey">
    <q-item class="col-auto self-start">
      <q-item-section class="col-auto">
        <q-select
          :value="shownPeriod"
          :options="periodOptions"
          emit-value
          map-options
          label="Time period"
          @input="saveShownPeriod"
        >
          <template #append>
            <q-icon name="mdi-chart-timeline" size="sm">
              <q-tooltip>
                <i>To improve performance, the history service automatically selects an averaging period.</i> <br />
                <i>One point is returned per period, with the average value of all points in that period.</i> <br />
                <div class="row q-mt-sm ">
                  <LabeledField
                    v-for="(rate, meas) in downsampling"
                    :key="meas"
                    :value="rate"
                    :label="meas"
                    item-aligned
                    class="col"
                  />
                </div>
              </q-tooltip>
            </q-icon>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
    <q-item class="col-auto column justify-around">
      <DatetimeField
        v-if="shownPeriod.start"
        :value="config.params.start"
        title="Start time"
        label="Start date and time"
        @input="saveStart"
      />
      <DurationInputField
        v-if="shownPeriod.duration"
        :value="config.params.duration"
        title="Duration"
        label="Duration"
        @input="saveDuration"
      />
      <DatetimeField
        v-if="shownPeriod.end"
        :value="config.params.end"
        title="End time"
        label="End date and time"
        @input="saveEnd"
      />
      <div v-if="isLive" class="q-pr-sm text-italic col-auto">
        Graph is live
      </div>
    </q-item>
  </div>
</template>
