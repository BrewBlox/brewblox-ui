<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { defaultPresets } from '@/components/Graph/getters';
import { nodeBuilder, targetSplitter, targetBuilder } from '@/components/Graph/functional';
import FormBase from '@/components/Form/FormBase';
import { durationString } from '@/helpers/functional';
import { ValueAxes, QueryParams } from '@/store/history/state';
import { fetchKnownKeys } from '@/store/history/actions';
import { fields } from '@/store/history/getters';
import Component from 'vue-class-component';
import has from 'lodash/has';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class GraphForm extends FormBase {
  period: PeriodDisplay | null = null;
  selectFilter: string | null = null;

  get periodOptions() {
    return [
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
  }

  findShownPeriod(): PeriodDisplay {
    const { params } = this.config;
    const keys = ['start', 'duration', 'end'];
    const matching = this.periodOptions
      .filter(opt => keys.every(k => opt.value[k] === !!params[k]));
    return matching.length > 0
      ? matching[0].value
      : this.periodOptions[0].value;
  }

  get shownPeriod(): PeriodDisplay {
    if (this.period === null) {
      this.period = this.findShownPeriod();
    }
    return this.period;
  }

  set shownPeriod(val: PeriodDisplay) {
    this.period = val;
    Object.keys(this.config.params)
      .filter(k => !has(this.period, k))
      .forEach(k => this.$delete(this.config.params, k));
  }

  get config(): GraphConfig {
    return this.$props.field;
  }

  get fields() {
    return fields(this.$store) as { [key: string]: string[] };
  }

  get nodes() {
    return nodeBuilder(this.fields);
  }

  get selected(): string[] | null {
    return targetSplitter(this.config.targets);
  }

  set selected(vals: string[] | null) {
    this.saveConfig({ ...this.config, targets: targetBuilder(vals || []) });
  }

  get renames() {
    return this.config.renames;
  }

  get axes(): ValueAxes {
    return this.config.axes;
  }

  get presets(): QueryParams[] {
    return defaultPresets();
  }

  isRightAxis(field: string) {
    return this.config.axes[field] === 'y2';
  }

  updateAxisSide(field: string, isRight: boolean) {
    this.config.axes[field] = isRight ? 'y2' : 'y';
    this.saveConfig();
  }

  created() {
    fetchKnownKeys(this.$store);
  }

  saveConfig(config: GraphConfig = this.config) {
    this.$props.onChangeField({ ...config });
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(); };
  }

  parseDuration(val: string): string {
    return durationString(val);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>

    <q-card-section>
      <q-expansion-item group="modal" icon="mdi-timetable" label="Period settings">
        <q-item dark>
          <q-item-section>Display type</q-item-section>
          <q-item-section>
            <SelectPopupEdit
              :field="shownPeriod"
              :options="periodOptions"
              :change="callAndSaveConfig(v => shownPeriod = v)"
              label="Display type"
            />
          </q-item-section>
        </q-item>
        <q-separator dark inset/>
        <q-item v-if="shownPeriod.start" dark>
          <q-item-section>Start time</q-item-section>
          <q-item-section>
            <DatetimePopupEdit
              :field="config.params.start"
              :change="callAndSaveConfig(v => config.params.start = v)"
              label="Start time"
              tag="big"
            />
          </q-item-section>
        </q-item>
        <q-item v-if="shownPeriod.duration" dark>
          <q-item-section>Duration</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="config.params.duration"
              :change="callAndSaveConfig(v => config.params.duration = parseDuration(v))"
              clearable
              label="Duration"
            />
          </q-item-section>
        </q-item>
        <q-item v-if="shownPeriod.end" dark>
          <q-item-section>End time</q-item-section>
          <q-item-section>
            <DatetimePopupEdit
              :field="config.params.end"
              :change="callAndSaveConfig(v => config.params.end = v)"
              label="End time"
              tag="big"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-file-tree" label="Metrics">
        <q-item dark>
          <q-item-section>
            <q-input
              v-model="selectFilter"
              placeholder="Filter keys"
              class="q-ma-none"
              dark
              clearable
            >
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn flat label="clear" icon="clear" @click="selected = []"/>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-scroll-area style="height: 300px; max-height: 30vh">
              <q-tree
                :nodes="nodes"
                :ticked.sync="selected"
                :filter="selectFilter"
                tick-strategy="leaf-filtered"
                dark
                node-key="value"
              />
            </q-scroll-area>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-tag-multiple" label="Legend">
        <q-item dark>
          <q-item-section>Metric</q-item-section>
          <q-item-section>Display as</q-item-section>
        </q-item>
        <q-separator dark inset/>
        <q-item v-for="field in selected" :key="field" dark>
          <q-item-section>{{ field }}</q-item-section>
          <q-item-section>
            <InputPopupEdit
              :field="renames[field]"
              :change="callAndSaveConfig(v => config.renames[field] = v)"
              label="Legend"
              clearable
              tag="span"
            />
          </q-item-section>
        </q-item>
        <q-item v-if="!selected || selected.length === 0" dark>
          <q-item-section side>No metrics selected</q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-chart-line" label="Axes">
        <q-item dark>
          <q-item-section>Metric</q-item-section>
          <q-item-section side>Left or right axis</q-item-section>
        </q-item>
        <q-separator dark inset/>
        <q-item
          v-for="field in selected"
          :key="field"
          dark
          clickable
          @click="updateAxisSide(field, !isRightAxis(field))"
        >
          <q-item-section>{{ field }}</q-item-section>
          <q-item-section side>
            <q-icon :class="{mirrored: isRightAxis(field)}" name="mdi-chart-line" size="30px"/>
          </q-item-section>
        </q-item>
        <q-item v-if="!selected || selected.length === 0" dark>
          <q-item-section side>No metrics selected</q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.mirrored {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
