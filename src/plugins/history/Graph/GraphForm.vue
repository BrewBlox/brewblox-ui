<script lang="ts">
import Component from 'vue-class-component';
import { Notify } from 'quasar';
import FormBase from '@/components/Widget/FormBase';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { toShadow, fromShadow, ShadowMapping, deepCopy } from '@/helpers/shadow-copy';
import { uniqueFilter } from '@/helpers/functional';
import { QueryParams, QueryTarget } from '@/store/history/state';
import {
  fields as availableFields,
  measurements as availableMeasurements,
} from '@/store/history/getters';
import { fetchKnownKeys } from '@/store/history/actions';

@Component({
  components: {
    WidgetField,
  },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
})
export default class GraphForm extends FormBase {
  $q: any;
  vals: { [key: string]: any; } = {};

  get inputMapping() {
    return {
      params: { path: 'params', default: {} },
      targets: { path: 'targets', default: [] },
      renames: { path: 'renames', default: {} },
    };
  }

  get inputValues(): { [key: string]: any; } {
    return this.vals;
  }

  set inputValues(values: { [key: string]: any; }) {
    this.vals = values;
  }

  get config() {
    return this.$props.value;
  }

  set config(config: any) {
    this.$emit('input', config);
  }

  get changed(): boolean {
    const state = toShadow(this.config, this.inputMapping);
    return JSON.stringify(state) !== JSON.stringify(this.inputValues);
  }

  get hasTargets() {
    return this.inputValues.targets
      && this.inputValues.targets.length > 0;
  }

  get knownFields() {
    return availableFields(this.$store);
  }

  reset() {
    this.inputValues = deepCopy(toShadow(this.config, this.inputMapping));
    fetchKnownKeys(this.$store);
  }

  cancelChanges() {
    this.reset();
  }

  confirmChanges() {
    this.config = fromShadow(
      this.inputValues,
      this.inputMapping,
      { ...this.config },
    );
    Notify.create({
      type: 'positive',
      position: 'bottom',
      message: 'Saved changes',
    });
  }

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
      .filter(uniqueFilter)
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
        items: availableMeasurements(this.$store)
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

  fieldRename(target: QueryTarget, field: string) {
    const key = `${target.measurement}/${field}`;
    return this.inputValues.renames[`${target.measurement}/${field}`] || key;
  }

  changeFieldRename(target: QueryTarget, field: string, name: string) {
    const key = `${target.measurement}/${field}`;
    if (!name || name === key) {
      this.$delete(this.inputValues.renames, key);
    } else {
      this.$set(this.inputValues.renames, key, name);
    }
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

          <q-datetime
            class="options-field"
            dark
            format24h
            clearable
            stack-label="Start"
            type="datetime"
            v-model="inputValues.params.start"
            :after="[
              {
                icon: 'restore',
                handler: () => inputValues.params.start = new Date(),
              }
            ]"
          />

          <q-input
            class="options-field"
            v-model="inputValues.params.duration"
            stack-label="Duration"
            clearable
          />

          <q-datetime
            class="options-field"
            dark
            format24h
            clearable
            no-parent-field
            stack-label="End"
            type="datetime"
            v-model="inputValues.params.end"
            :after="[
              {
                icon: 'restore',
                handler: () => inputValues.params.end = new Date(),
              }
            ]"
          />

        </div>

        <div class="options-edit-container">
          <q-input
            class="options-field"
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
              class="options-field"
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
            <q-input
              clearable
              stack-label="Display name"
              :value="fieldRename(target, field)"
              @input="v => changeFieldRename(target, field, v)"
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

    </q-card-main>
  </q-card>
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
</style>

