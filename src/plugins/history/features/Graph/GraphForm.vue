<script lang="ts">
import Component from 'vue-class-component';
import HistoryForm from '@/plugins/history/components/HistoryForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { QueryParams } from '@/plugins/history/state';
import {
  fields as availableFields,
  measurements as availableMeasurements,
} from '@/plugins/history/store/getters';

@Component({
  components: {
    WidgetField,
  },
})
export default class GraphForm extends HistoryForm {
  $q: any;

  get inputMapping() {
    return {
      params: { path: 'params', default: [] },
    };
  }

  get hasOptions() {
    return this.inputValues.params.length > 0;
  }

  get sharedParams(): QueryParams {
    return this.inputValues.params[0] || {};
  }

  get knownFields() {
    return availableFields(this.$store, this.config.serviceId);
  }

  uniqueFilter = (val: any, idx: number, coll: any[]) =>
    coll.indexOf(val) === idx;

  fieldSections = (field: string) =>
    field.split('/');

  updateSharedOption(key: string, val: any) {
    this.inputValues.params.forEach((params: QueryParams) => this.$set(params, key, val));
  }

  optionFields(params: QueryParams) {
    return this.knownFields[params.measurement] || [];
  }

  fieldValid(params: QueryParams, field: string): boolean {
    return this.optionFields(params).includes(field);
  }

  addField(params: QueryParams) {
    this.$set(params, 'fields', [...params.fields, '']);
  }

  removeField(params: QueryParams, index: number) {
    this.$set(params, 'fields', params.fields.filter((_, idx) => idx !== index));
  }

  changeField(params: QueryParams, index: number, val: string) {
    params.fields[index] = this.fieldValid(params, val)
      ? val
      : `${val}/`;
    this.$set(params, 'fields', [...params.fields]);
  }

  fieldSectionOptions(params: QueryParams, field: string, idx: number) {
    const pattern = this.fieldSections(field).slice(0, idx).join('/');

    return this.optionFields(params)
      .filter(fkey => fkey.startsWith(pattern))
      .map(fkey => this.fieldSections(fkey)[idx])
      .filter(this.uniqueFilter)
      .map(section => ({ label: section, value: section }));
  }

  changeFieldSection(params: QueryParams, fieldIndex: number, sectionIndex: number, val: string) {
    const sections = [
      ...this.fieldSections(params.fields[fieldIndex]).slice(0, sectionIndex),
      val,
    ];
    this.changeField(params, fieldIndex, sections.join('/'));
  }

  addOptions() {
    this.$q.dialog({
      title: 'Add data source',
      message: 'Select data source',
      cancel: true,
      options: {
        type: 'radio',
        model: 'opt2',
        items: availableMeasurements(this.$store, this.config.serviceId)
          .map(m => ({ label: m, value: m })),
      },
    }).then((m: string) =>
      this.$set(
        this.inputValues,
        'params',
        [
          ...this.inputValues.params,
          {
            ...this.sharedParams,
            measurement: m,
            fields: [''], // avoid initializing as "select * from {measurement}"
          },
        ],
      ));
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <!-- shared history params config -->
      <widget-field
        v-if="hasOptions"
        icon="edit"
        label="History settings"
      >
        <div class="options-edit-container">

          <q-input
            :value="sharedParams.start"
            @input="v => updateSharedOption('start', v)"
            stack-label="Start"
            clearable
          >
            <q-popover fit :offset="[0, 10]">
              <q-datetime-picker
                dark
                format24h
                type="datetime"
                :value="sharedParams.start"
                @input="v => updateSharedOption('start', v)"
              />
            </q-popover>
          </q-input>

          <q-input
            :value="sharedParams.duration"
            @input="v => updateSharedOption('duration', v)"
            stack-label="Duration"
            clearable
          />

          <q-input
            :value="sharedParams.end"
            @input="v => updateSharedOption('end', v)"
            stack-label="End"
            clearable
          >
            <q-popover fit :offset="[0, 10]">
              <q-datetime-picker
                dark
                format24h
                type="datetime"
                :value="sharedParams.end"
                @input="v => updateSharedOption('end', v)"
              />
            </q-popover>
          </q-input>

        </div>

        <div class="options-edit-container">
          <q-input
            :value="sharedParams.approxPoints"
            @input="v => updateSharedOption('approxPoints', v)"
            stack-label="Points after downsampling"
            type="number"
          />
        </div>

        <q-card-separator />
      </widget-field>

      <!-- history params fields -->
      <div
        v-for="params in inputValues.params"
        :key="params.measurement"
      >
        <widget-field
          icon="show_chart"
          :label="`${params.measurement} fields`"
        >
          <div
            class="options-edit-container"
            v-for="(field, fieldIdx) in params.fields"
            :key="fieldIdx"
          >
            <q-select
              v-for="(section, sectionIdx) in fieldSections(field)"
              :key="sectionIdx"
              :options="fieldSectionOptions(params, field, sectionIdx)"
              :value="section"
              @change="val => changeFieldSection(params, fieldIdx, sectionIdx, val)"
            />
            <q-icon
              name="check"
              color="positive"
              v-if="fieldValid(params, field)"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              label="Remove field"
              @click="removeField(params, fieldIdx)"
            />
          </div>
          <q-btn
            icon="add"
            label="Add field"
            @click="addField(params)"
          />
        </widget-field>
        <q-card-separator />
      </div>

      <!-- new source button -->
      <widget-field
        label="New source"
        icon="add"
      >
        <q-btn
          label="Add source"
          @click="addOptions"
        />
      </widget-field>
      <q-card-separator />

      <!-- card actions -->
      <q-card-actions align="end">
        <q-btn
          flat
          label="Reset"
          color="primary"
          :disabled="!changed"
          @click="cancelChanges"
        />
        <q-btn
          flat
          label="Save"
          color="primary"
          @click="confirmChanges"
        />
      </q-card-actions>

    </q-card-main>
  </q-card>
</template>

<style scoped lang="stylus">
@import '../../../../../src/css/app.styl';

.options-edit-container > .q-icon {
  margin: 0 15px 0 5px;
}

.options-edit-container {
  background: $dark;
  padding: 10px;
  display: flex;
  margin-bottom: 10px;
}

.options-edit-container .q-select {
  width: 160px;
  margin-right: 15px;
}

.options-edit-container .q-input {
  width: 160px;
  margin-right: 15px;
}

.options-edit-container .q-btn.q-btn-flat {
  margin-right: auto;
}
</style>

