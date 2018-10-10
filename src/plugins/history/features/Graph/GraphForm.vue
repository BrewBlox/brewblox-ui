<script lang="ts">
import Component from 'vue-class-component';
import HistoryForm from '@/plugins/history/components/HistoryForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { HistoryOptions } from '@/plugins/history/state';
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
      options: { path: 'options', default: [] },
    };
  }

  get hasOptions() {
    return this.inputValues.options.length > 0;
  }

  get sharedOptions(): HistoryOptions {
    return this.inputValues.options[0] || {};
  }

  get knownFields() {
    return availableFields(this.$store, this.config.serviceId);
  }

  uniqueFilter = (val: any, idx: number, coll: any[]) =>
    coll.indexOf(val) === idx;

  fieldSections = (field: string) =>
    field.split('/');

  updateSharedOption(key: string, val: any) {
    this.inputValues.options.forEach((opt: HistoryOptions) => this.$set(opt, key, val));
  }

  optionFields(opt: HistoryOptions) {
    return this.knownFields[opt.measurement] || [];
  }

  fieldValid(opt: HistoryOptions, field: string): boolean {
    return this.optionFields(opt).includes(field);
  }

  addField(opt: HistoryOptions) {
    this.$set(opt, 'fields', [...opt.fields, '']);
  }

  removeField(opt: HistoryOptions, index: number) {
    this.$set(opt, 'fields', opt.fields.filter((_, idx) => idx !== index));
  }

  changeField(opt: HistoryOptions, index: number, val: string) {
    opt.fields[index] = this.fieldValid(opt, val)
      ? val
      : `${val}/`;
    this.$set(opt, 'fields', [...opt.fields]);
  }

  fieldSectionOptions(opt: HistoryOptions, field: string, idx: number) {
    const pattern = this.fieldSections(field).slice(0, idx).join('/');

    return this.optionFields(opt)
      .filter(fkey => fkey.startsWith(pattern))
      .map(fkey => this.fieldSections(fkey)[idx])
      .filter(this.uniqueFilter)
      .map(section => ({ label: section, value: section }));
  }

  changeFieldSection(opt: HistoryOptions, fieldIndex: number, sectionIndex: number, val: string) {
    const sections = [
      ...this.fieldSections(opt.fields[fieldIndex]).slice(0, sectionIndex),
      val,
    ];
    this.changeField(opt, fieldIndex, sections.join('/'));
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
        'options',
        [
          ...this.inputValues.options,
          {
            ...this.sharedOptions,
            measurement: m,
            fields: [],
          },
        ],
      ));
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <!-- shared history options config -->
      <widget-field
        v-if="hasOptions"
        icon="edit"
        label="History settings"
      >
        <div class="options-edit-container">

          <q-input
            :value="sharedOptions.start"
            @input="v => updateSharedOption('start', v)"
            stack-label="Start"
            clearable
          >
            <q-popover fit :offset="[0, 10]">
              <q-datetime-picker
                dark
                format24h
                type="datetime"
                :value="sharedOptions.start"
                @input="v => updateSharedOption('start', v)"
              />
            </q-popover>
          </q-input>

          <q-input
            :value="sharedOptions.duration"
            @input="v => updateSharedOption('duration', v)"
            stack-label="Duration"
            clearable
          />

          <q-input
            :value="sharedOptions.end"
            @input="v => updateSharedOption('end', v)"
            stack-label="End"
            clearable
          >
            <q-popover fit :offset="[0, 10]">
              <q-datetime-picker
                dark
                format24h
                type="datetime"
                :value="sharedOptions.end"
                @input="v => updateSharedOption('end', v)"
              />
            </q-popover>
          </q-input>

        </div>

        <div class="options-edit-container">
          <q-input
            :value="sharedOptions.approxPoints"
            @input="v => updateSharedOption('approxPoints', v)"
            stack-label="Points after downsampling"
            type="number"
          />
        </div>

        <q-card-separator />
      </widget-field>

      <!-- history options fields -->
      <div
        v-for="opt in inputValues.options"
        :key="opt.measurement"
      >
        <widget-field
          icon="show_chart"
          :label="`${opt.measurement} fields`"
        >
          <div
            class="options-edit-container"
            v-for="(field, fieldIdx) in opt.fields"
            :key="fieldIdx"
          >
            <q-select
              v-for="(section, sectionIdx) in fieldSections(field)"
              :key="sectionIdx"
              :options="fieldSectionOptions(opt, field, sectionIdx)"
              :value="section"
              @change="val => changeFieldSection(opt, fieldIdx, sectionIdx, val)"
            />
            <q-icon
              name="check"
              color="positive"
              v-if="fieldValid(opt, field)"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              label="Remove field"
              @click="removeField(opt, fieldIdx)"
            />
          </div>
          <q-btn
            icon="add"
            label="Add field"
            @click="addField(opt)"
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

