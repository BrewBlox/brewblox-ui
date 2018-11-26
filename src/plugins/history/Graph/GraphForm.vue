<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import FormBase from '@/components/Widget/FormBase';
import { durationString } from '@/helpers/functional';
import { fetchKnownKeys } from '@/store/history/actions';
import { measurements } from '@/store/history/getters';
import { QueryTarget } from '@/store/history/state';
import Component from 'vue-class-component';
import FieldPopupEdit from './FieldPopupEdit.vue';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component({
  props: {
    buttons: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    FieldPopupEdit,
  },
})
export default class GraphForm extends FormBase {
  $q: any;
  period: PeriodDisplay | null = null;

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
    const params = this.config.params;
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
    return this.$props.field as GraphConfig;
  }

  created() {
    fetchKnownKeys(this.$store);
  }

  saveConfig(config: GraphConfig = this.config) {
    this.$props.change(config);
  }

  callAndSaveConfig(func: (v: any) => void) {
    return (v: any) => { func(v); this.saveConfig(); };
  }

  addTarget() {
    this.$q.dialog({
      title: 'Add data source',
      message: 'Select data source',
      cancel: true,
      options: {
        type: 'radio',
        model: 'opt2',
        items: measurements(this.$store)
          .map(m => ({ label: m, value: m })),
      },
    }).then((m: string) => {
      this.config.targets.push({ measurement: m, fields: [] });
      this.saveConfig();
    });
  }

  removeTarget(index: number) {
    this.config.targets = this.config.targets.filter((_, idx) => idx !== index);
  }

  removeField(target: QueryTarget, index: number) {
    target.fields = target.fields.filter((_, idx) => idx !== index);
  }

  fieldRename(target: QueryTarget, field: string) {
    if (!field) {
      return '';
    }
    const key = `${target.measurement}/${field}`;
    return this.config.renames[`${target.measurement}/${field}`] || key;
  }

  changeFieldRename(target: QueryTarget, field: string, name: string) {
    if (!field) {
      return;
    }
    const defaultKey = `${target.measurement}/${field}`;
    if (!name || name === defaultKey) {
      delete this.config.renames[defaultKey];
    } else {
      this.config.renames[defaultKey] = name;
    }
  }

  parseDuration(val: string): string {
    return durationString(val);
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-btn
      rounded
      v-close-overlay
      v-if="$props.buttons"
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <q-card dark>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Points after downsampling">
          <InputPopupEdit
            label="Points after downsampling"
            type="number"
            :field="config.params.approxPoints"
            :change="callAndSaveConfig(v => config.params.approxPoints = v)"
          />
        </q-field>
        <q-field class="col" label="Display type">
          <SelectPopupEdit
            label="Display type"
            :field="shownPeriod"
            :options="periodOptions"
            :change="callAndSaveConfig(v => shownPeriod = v)"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card dark>
      <q-card-title>Period settings</q-card-title>
      <q-card-main>
        <q-field v-if="shownPeriod.start" class="col" label="Start time">
          <DatetimePopupEdit
            label="Start time"
            display="big"
            :field="config.params.start"
            :change="callAndSaveConfig(v => config.params.start = v)"
          />
        </q-field>
        <q-field v-if="shownPeriod.duration" class="col" label="Duration">
          <InputPopupEdit
            clearable
            label="Duration"
            :field="config.params.duration"
            :change="callAndSaveConfig(v => config.params.duration = parseDuration(v))"
          />
        </q-field>
        <q-field v-if="shownPeriod.end" class="col" label="End time">
          <DatetimePopupEdit
            label="End time"
            display="big"
            :field="config.params.end"
            :change="callAndSaveConfig(v => config.params.end = v)"
          />
        </q-field>
        <!-- <div class="options-edit-container"></div> -->
      </q-card-main>
    </q-card>
    <q-card dark v-for="(target, targetIdx) in config.targets" :key="targetIdx">
      <q-card-title>
        {{ target.measurement }}
        <q-btn
          slot="right"
          flat
          dense
          icon="delete"
          label="Delete source"
          @click="removeTarget(targetIdx); saveConfig();"
        />
      </q-card-title>
      <q-card-main>
        <div class="row no-wrap" v-for="(field, fieldIdx) in target.fields" :key="fieldIdx">
          <q-field class="col" label="Field" orientation="vertical">
            <FieldPopupEdit
              label="field"
              :field="field"
              :measurement="target.measurement"
              :change="callAndSaveConfig(v => target.fields[fieldIdx] = v)"
            />
          </q-field>
          <q-field class="col" label="Display name" orientation="vertical">
            <InputPopupEdit
              :disabled="!field"
              clearable
              label="Display name"
              :field="fieldRename(target, field)"
              :change="callAndSaveConfig(v => changeFieldRename(target, field, v))"
            />
          </q-field>
          <q-field class="col1" label=" " orientation="vertical">
            <q-btn flat dense icon="delete" @click="removeField(target, fieldIdx); saveConfig();"/>
          </q-field>
        </div>
      </q-card-main>
      <q-card-main>
        <q-btn flat dense icon="add" label="Add field" @click="target.fields.push('')"/>
      </q-card-main>
    </q-card>
    <q-card dark>
      <q-card-main>
        <q-btn flat dense label="Add source" @click="addTarget"/>
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped lang="stylus">
@import '../../../../src/css/app.styl';

.options-edit-container > .q-icon {
  margin: 0 15px 0 5px;
}

.options-edit-container {
  background: $dark;
  padding: 10px;
  display: flex;
  margin-bottom: 10px;
}

.options-field {
  width: 160px;
  margin-right: 15px;
}

.options-edit-container .q-btn.q-btn-flat {
  margin-right: auto;
}

.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

