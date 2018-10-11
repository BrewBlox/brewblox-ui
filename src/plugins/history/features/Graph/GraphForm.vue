<script lang="ts">
import Component from 'vue-class-component';
import HistoryForm from '@/plugins/history/components/HistoryForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { QueryParams, QueryTarget } from '@/plugins/history/state';
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
      params: { path: 'params', default: {} },
      targets: { path: 'targets', default: [] },
    };
  }

  get hasTargets() {
    return this.inputValues.targets.length > 0;
  }

  get knownFields() {
    return availableFields(this.$store, this.config.serviceId);
  }

  uniqueFilter = (val: any, idx: number, coll: any[]) =>
    coll.indexOf(val) === idx;

  fieldSections = (field: string) =>
    field.split('/');

  relevantKnownFields(target: QueryTarget) {
    return this.knownFields[target.measurement] || [];
  }

  fieldValid(target: QueryTarget, field: string): boolean {
    return this.relevantKnownFields(target).includes(field);
  }

  updateFields(target: QueryTarget, fields: string[]) {
    this.$set(target, 'fields', fields);
  }

  addField(target: QueryTarget) {
    this.updateFields(target, [...target.fields, '']);
  }

  removeField(target: QueryTarget, index: number) {
    this.updateFields(target, target.fields.filter((_, idx) => idx !== index));
  }

  changeField(target: QueryTarget, index: number, val: string) {
    target.fields[index] = this.fieldValid(target, val)
      ? val
      : `${val}/`;
    this.updateFields(target, [...target.fields]);
  }

  fieldSectionOptions(target: QueryTarget, field: string, idx: number) {
    const pattern = this.fieldSections(field).slice(0, idx).join('/');

    return this.relevantKnownFields(target)
      .filter(fkey => fkey.startsWith(pattern))
      .map(fkey => this.fieldSections(fkey)[idx])
      .filter(this.uniqueFilter)
      .map(section => ({ label: section, value: section }));
  }

  changeFieldSection(target: QueryTarget, fieldIndex: number, sectionIndex: number, val: string) {
    const sections = [
      ...this.fieldSections(target.fields[fieldIndex]).slice(0, sectionIndex),
      val,
    ];
    this.changeField(target, fieldIndex, sections.join('/'));
  }

  addTarget() {
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
        'targets',
        [
          ...this.inputValues.targets,
          {
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

      <!-- shared history params config -->
      <widget-field
        v-if="hasTargets"
        icon="edit"
        label="History settings"
      >
        <div class="options-edit-container">

          <q-input
            v-model="inputValues.params.start"
            stack-label="Start"
            clearable
          >
            <q-popover fit :offset="[0, 10]">
              <q-datetime-picker
                dark
                format24h
                type="datetime"
                v-model="inputValues.params.start"
              />
            </q-popover>
          </q-input>

          <q-input
            v-model="inputValues.params.duration"
            stack-label="Duration"
            clearable
          />

          <q-input
            v-model="inputValues.params.end"
            stack-label="End"
            clearable
          >
            <q-popover fit :offset="[0, 10]">
              <q-datetime-picker
                dark
                format24h
                type="datetime"
                v-model="inputValues.params.end"
              />
            </q-popover>
          </q-input>

        </div>

        <div class="options-edit-container">
          <q-input
            v-model="inputValues.params.approxPoints"
            stack-label="Points after downsampling"
            type="number"
          />
        </div>

        <q-card-separator />
      </widget-field>

      <!-- history target fields -->
      <div
        v-for="target in inputValues.targets"
        :key="target.measurement"
      >
        <widget-field
          icon="show_chart"
          :label="`${target.measurement} fields`"
        >
          <div
            class="options-edit-container"
            v-for="(field, fieldIdx) in target.fields"
            :key="fieldIdx"
          >
            <q-select
              v-for="(section, sectionIdx) in fieldSections(field)"
              :key="sectionIdx"
              :options="fieldSectionOptions(target, field, sectionIdx)"
              :value="section"
              @change="val => changeFieldSection(target, fieldIdx, sectionIdx, val)"
            />
            <q-icon
              name="check"
              color="positive"
              v-if="fieldValid(target, field)"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              label="Remove field"
              @click="removeField(target, fieldIdx)"
            />
          </div>
          <q-btn
            icon="add"
            label="Add field"
            @click="addField(target)"
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
          @click="addTarget"
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

