<script lang="ts">
import find from 'lodash/find';
import matches from 'lodash/matches';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { durationMs } from '@/helpers/functional';
import { QueryConfig, QueryParams } from '@/store/history';

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

  updateShownPeriod(val: PeriodDisplay): void {
    this.period = val;
    this.sanitizeParams(val);
    this.saveConfig(this.config);
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
          label="Display type"
          @input="updateShownPeriod"
        />
      </q-item-section>
    </q-item>
    <q-item dark class="col-auto column justify-around">
      <q-item-label caption>
        Settings
      </q-item-label>
      <div v-if="shownPeriod.start" class="col row no-wrap">
        <span class="q-pr-sm text-italic col-auto">Start time</span>
        <DatetimeField
          :value="config.params.start"
          title="Start time"
          label="Start date and time"
          tag="div"
          tag-class="col"
          @input="v => { config.params.start = v.getTime(); saveConfig(); }"
        />
      </div>
      <div v-if="shownPeriod.duration" class="col row no-wrap">
        <span class="q-pr-sm text-italic col-auto">Duration</span>
        <InputField
          :value="config.params.duration"
          title="Duration"
          label="Duration"
          tag="div"
          tag-class="col"
          @input="v => { config.params.duration = durationString(v); saveConfig(); }"
        />
      </div>
      <div v-if="shownPeriod.end" class="col row no-wrap">
        <span class="q-pr-sm text-italic col-auto">End time</span>
        <DatetimeField
          :value="config.params.end"
          title="End time"
          label="End date and time"
          tag="div"
          tag-class="col"
          @input="v => { config.params.end = v.getTime(); saveConfig(); }"
        />
      </div>
      <div v-if="isLive" class="col q-pr-sm text-italic">
        Graph is Live
      </div>
    </q-item>
  </div>
  <!-- <q-item dark class="col-auto">
      <q-item-section class="col-auto">
        <q-item-label caption>
          Averaging period
        </q-item-label>
        <div class="row q-mt-sm q-ml-sm">
          <div v-for="(rate, meas) in downsampling" :key="meas" class="q-mr-md">
            <q-item-label caption>
              {{ meas }}
            </q-item-label>
            {{ rate }}
          </div>
        </div>
        <q-tooltip>
          To improve performance, the history service automatically selects an averaging period.
          <br />One point is returned per period, with the average value of all points in that period.
        </q-tooltip>
      </q-item-section>
    </q-item>
  </div> -->
</template>
