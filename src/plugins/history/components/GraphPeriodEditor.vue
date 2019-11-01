<script lang="ts">
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

  updateShownPeriod(val: PeriodDisplay): void {
    this.period = val;
    this.sanitizeParams(val);
    this.saveConfig(this.config);
  }
}
</script>

<template>
  <!-- <div class="row align-children"> -->
  <q-list dark class="col">
    <q-item dark>
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
    <q-item dark>
      <q-item-section v-if="shownPeriod.start" class="col-6">
        <q-item-label caption>
          Start time
        </q-item-label>
        <DatetimeField
          :value="config.params.start"
          title="Start time"
          @input="v => { config.params.start = v.getTime(); saveConfig(); }"
        />
      </q-item-section>
      <q-item-section v-if="shownPeriod.duration" class="col-6">
        <q-item-label caption>
          Duration
        </q-item-label>
        <InputField
          :value="config.params.duration"
          title="Duration"
          @input="v => { config.params.duration = durationString(v); saveConfig(); }"
        />
      </q-item-section>
      <q-item-section v-if="shownPeriod.end" class="col-6">
        <q-item-label caption>
          End time
        </q-item-label>
        <DatetimeField
          :value="config.params.end"
          title="End time"
          @input="v => { config.params.end = v.getTime(); saveConfig(); }"
        />
      </q-item-section>
    </q-item>
  </q-list>
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
