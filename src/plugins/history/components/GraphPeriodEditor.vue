<script lang="ts">
import find from 'lodash/find';
import matches from 'lodash/matches';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { durationMs, durationString } from '@/helpers/functional';
import { QueryConfig, QueryParams } from '@/store/history';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphPeriodEditor extends Vue {
  prefixClass = 'q-pr-sm text-italic col-auto';
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

  sanitizeParams(period: PeriodDisplay): void {
    const defaults = this.paramDefaults();
    Object.entries(period)
      .forEach(([key, isPresent]: [string, boolean]) =>
        this.$set(
          this.config.params,
          key,
          (isPresent
            ? this.config.params[key] || defaults[key]
            : undefined)
        ));
  }

  get shownPeriod(): PeriodDisplay {
    if (this.period === null) {
      const keys = ['start', 'duration', 'end'];
      const compare = (opt, k): boolean => {
        const val = this.config.params[k];
        return opt.value[k] === (val !== null && val !== undefined);
      };
      const matching = this.periodOptions
        .find(opt => keys.every(k => compare(opt, k)));

      // set local variable
      this.period = matching
        ? matching.value
        : this.periodOptions[0].value;

      // if no match was found, params must be sanitized
      if (!matching) {
        this.sanitizeParams(this.period!);
        this.saveConfig(this.config);
      }
    }
    return this.period!;
  }

  get isLive(): boolean {
    const opt = find(this.periodOptions, matches({ value: this.shownPeriod }));
    return opt !== undefined && opt.label.startsWith('Live');
  }

  saveShownPeriod(val: PeriodDisplay): void {
    this.period = val;
    this.sanitizeParams(val);
    this.saveConfig(this.config);
  }

  saveStart(val: Date): void {
    this.config.params.start = val.getTime();
    this.saveConfig();
  }

  saveDuration(val: string): void {
    this.config.params.duration = durationString(val || '10m');
    this.saveConfig();
  }

  saveEnd(val: Date): void {
    this.config.params.end = val.getTime();
    this.saveConfig();
  }
}
</script>

<template>
  <div class="row wrap q-px-sm">
    <q-item dark class="col-auto">
      <q-item-section class="col-auto">
        <q-select
          :value="shownPeriod"
          :options="periodOptions"
          emit-value
          map-options
          dark
          options-dark
          label="Time period"
          @input="saveShownPeriod"
        />
      </q-item-section>
    </q-item>
    <q-item dark class="col-auto column justify-around q-pt-lg">
      <div v-if="shownPeriod.start" class="col row no-wrap">
        <span :class="prefixClass">Start time is</span>
        <DatetimeField
          :value="config.params.start"
          title="Start time"
          label="Start date and time"
          tag="div"
          tag-class="col"
          @input="saveStart"
        />
      </div>
      <div v-if="shownPeriod.duration" class="col row no-wrap">
        <span :class="prefixClass">Duration is</span>
        <DurationInputField
          :value="config.params.duration"
          title="Duration"
          label="Duration"
          tag="div"
          tag-class="col"
          @input="saveDuration"
        />
      </div>
      <div v-if="shownPeriod.end" class="col row no-wrap">
        <span :class="prefixClass">End time is</span>
        <DatetimeField
          :value="config.params.end"
          title="End time"
          label="End date and time"
          tag="div"
          tag-class="col"
          @input="saveEnd"
        />
      </div>
      <div v-if="isLive" :class="prefixClass">
        Graph is live
      </div>
    </q-item>
    <q-item dark class="col-auto">
      <q-item-section avatar>
        <q-icon name="mdi-chart-timeline" color="grey-4">
          <q-tooltip>
            <i>To improve performance, the history service automatically selects an averaging period.</i> <br />
            <i>One point is returned per period, with the average value of all points in that period.</i> <br />
            <div class="row q-mt-sm ">
              <q-item v-for="(rate, meas) in downsampling" :key="meas" dark class="q-mr-md">
                <q-item-section>
                  <q-item-label caption>
                    {{ meas }}
                  </q-item-label>
                  {{ rate }}
                </q-item-section>
              </q-item>
            </div>
          </q-tooltip>
        </q-icon>
      </q-item-section>
    </q-item>
  </div>
</template>
