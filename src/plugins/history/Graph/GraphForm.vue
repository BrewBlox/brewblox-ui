<script lang="ts">
import { GraphConfig } from '@/components/Graph/state';
import FormBase from '@/components/Widget/FormBase';
import { durationString } from '@/helpers/functional';
import { fetchKnownKeys } from '@/store/history/actions';
import { measurements } from '@/store/history/getters';
import { QueryTarget } from '@/store/history/state';
import parseDuration from 'parse-duration';
import Component from 'vue-class-component';
import FieldPopupEdit from './FieldPopupEdit.vue';

@Component({
  components: {
    FieldPopupEdit,
  },
})
export default class GraphForm extends FormBase {
  $q: any;
  error: string | null = null;

  get config(): GraphConfig {
    return this.$props.field as GraphConfig;
  }

  created() {
    fetchKnownKeys(this.$store);
  }

  saveConfig(config: GraphConfig = this.config) {
    if (config.params.start && config.params.duration && config.params.end) {
      this.error = 'Unable to set start, duration, and end at the same time';
      return;
    }
    this.error = null;
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

  durationString(valMs: number) {
    return durationString(valMs);
  }

  parseDuration(val: string) {
    return parseDuration(val);
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card dark>
      <q-card-title>Period settings</q-card-title>
      <q-alert color="warning" icon="warning" v-if="error">{{error}}</q-alert>
      <q-card-main>
        <div class="options-edit-container">
          <q-field class="col" label="Start time" orientation="vertical">
            <DatetimePopupEdit
              label="Start time"
              display="big"
              :field="config.params.start"
              :change="callAndSaveConfig(v => config.params.start = v)"
            />
          </q-field>
          <q-field class="col" label="Duration" orientation="vertical">
            <InputPopupEdit
              clearable
              label="Duration"
              :field="durationString(config.params.duration)"
              :change="callAndSaveConfig(v => config.params.duration = parseDuration(v))"
            />
          </q-field>
          <q-field class="col" label="End time" orientation="vertical">
            <DatetimePopupEdit
              label="End time"
              display="big"
              :field="config.params.end"
              :change="callAndSaveConfig(v => config.params.end = v)"
            />
          </q-field>
        </div>
        <div class="options-edit-container">
          <q-field class="col" label="Points after downsampling" orientation="vertical">
            <InputPopupEdit
              label="Points after downsampling"
              type="number"
              :field="config.params.approxPoints"
              :change="callAndSaveConfig(v => config.params.approxPoints = v)"
            />
          </q-field>
        </div>
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
              :disable="!field"
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

