<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import { nodeBuilder, targetSplitter, targetBuilder } from '@/components/Graph/functional';
import FormBase from '@/components/Form/FormBase';
import { durationString } from '@/helpers/functional';
import { fetchKnownKeys } from '@/store/history/actions';
import { fields } from '@/store/history/getters';
import Component from 'vue-class-component';
import FieldPopupEdit from './FieldPopupEdit.vue';
import { ValueAxes } from '@/store/history/state';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component({
  components: {
    FieldPopupEdit,
  },
})
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
      .filter(k => !(this.period || {})[k])
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
  <div class="widget-modal column">
    <WidgetSettings v-if="!$props.embedded" v-bind="$props"/>

    <q-collapsible group="modal" class="col-12" icon="mdi-timetable" label="Period settings">
      <div>
        <q-field label="Display type">
          <SelectPopupEdit
            :field="shownPeriod"
            :options="periodOptions"
            :change="callAndSaveConfig(v => shownPeriod = v)"
            label="Display type"
          />
        </q-field>
        <q-item-separator/>
        <q-field v-if="shownPeriod.start" label="Start time">
          <DatetimePopupEdit
            :field="config.params.start"
            :change="callAndSaveConfig(v => config.params.start = v)"
            label="Start time"
            display="big"
          />
        </q-field>
        <q-field v-if="shownPeriod.duration" label="Duration">
          <InputPopupEdit
            :field="config.params.duration"
            :change="callAndSaveConfig(v => config.params.duration = parseDuration(v))"
            clearable
            label="Duration"
          />
        </q-field>
        <q-field v-if="shownPeriod.end" label="End time">
          <DatetimePopupEdit
            :field="config.params.end"
            :change="callAndSaveConfig(v => config.params.end = v)"
            label="End time"
            display="big"
          />
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-file-tree" label="Metrics">
      <div>
        <div class="q-mb-sm row no-wrap items-center">
          <q-input v-model="selectFilter" stack-label="Filter" class="q-ma-none" clearable/>
        </div>
        <q-tree
          :nodes="nodes"
          :ticked.sync="selected"
          :filter="selectFilter"
          tick-strategy="leaf-filtered"
          dark
          node-key="value"
        />
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-tag-multiple" label="Legend">
      <q-list no-border separator>
        <q-item>
          <q-item-main>Metric</q-item-main>Display as
        </q-item>
        <q-item v-for="field in selected" :key="field">
          <q-item-main>{{ field }}</q-item-main>
          <InputPopupEdit
            :field="renames[field]"
            :change="callAndSaveConfig(v => config.renames[field] = v)"
            label="Legend"
            clearable
            display="span"
          />
        </q-item>
        <q-item v-if="!selected || selected.length === 0">
          <q-item-main class="darkened">No metrics selected</q-item-main>
        </q-item>
      </q-list>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-chart-line" label="Axes">
      <q-list no-border separator>
        <q-item>
          <q-item-main>Metric</q-item-main>Left or right axis
        </q-item>
        <q-item v-for="field in selected" :key="field">
          <q-item-main>{{ field }}</q-item-main>
          <q-btn
            :class="{mirrored: isRightAxis(field)}"
            flat
            size="lg"
            icon="mdi-chart-line"
            @click="updateAxisSide(field, !isRightAxis(field))"
          />
        </q-item>
        <q-item v-if="!selected || selected.length === 0">
          <q-item-main class="darkened">No metrics selected</q-item-main>
        </q-item>
      </q-list>
    </q-collapsible>
  </div>
</template>

<style scoped>
.mirrored {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
