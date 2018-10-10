<script lang="ts">
import Component from 'vue-class-component';
import HistoryForm from '@/plugins/history/components/HistoryForm';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { HistoryOptions } from '@/plugins/history/state';
import { fields as availableFields } from '@/plugins/history/store/getters';

@Component({
  components: {
    WidgetField,
  },
})
export default class GraphForm extends HistoryForm {
  get inputMapping() {
    return {
      options: { path: 'options', default: [] },
    };
  }

  get knownFields() {
    return availableFields(this.$store, this.config.serviceId);
  }

  uniqueFilter = (val: any, idx: number, coll: any[]) =>
    coll.indexOf(val) === idx;

  fieldSections = (field: string) =>
    field.split('/');

  optionFields(opt: HistoryOptions) {
    return this.knownFields[opt.measurement] || [];
  }

  fieldValid(opt: HistoryOptions, field: string): boolean {
    return this.optionFields(opt).includes(field);
  }

  addField(opt: HistoryOptions, val = '') {
    this.$set(opt, 'keys', [...opt.fields, val]);
  }

  removeField(opt: HistoryOptions, index: number) {
    this.$set(opt, 'keys', opt.fields.filter((_, idx) => idx !== index));
  }

  changeField(opt: HistoryOptions, index: number, val: string) {
    opt.fields[index] = this.fieldValid(opt, val)
      ? val
      : `${val}/`;
    this.$set(opt, 'keys', [...opt.fields]);
  }

  fieldSectionOptions(opt: HistoryOptions, field: string, idx: number) {
    const pattern = this.fieldSections(field).slice(0, idx).join('/');

    return this.optionFields(opt)
      .filter(fkey => fkey.startsWith(pattern))
      .map(fkey => fkey.split('/')[idx])
      .filter(this.uniqueFilter)
      .map(section => ({ label: section, value: section }));
  }

  changeFieldSection(opt: HistoryOptions, fieldIndex: number, sectionIndex: number, val: string) {
    const sections = [
      ...opt.fields[fieldIndex].split('/').slice(0, sectionIndex),
      val,
    ];
    this.changeField(opt, fieldIndex, sections.join('/'));
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <div
        v-for="opt in inputValues.options"
        :key="opt.measurement"

      >

        <widget-field
          icon="edit"
          :label="`${opt.measurement} settings`"
        >
          <div class="options-edit-container">
          <q-input
            v-model="opt.start"
            stack-label="Start"
          />
          <q-input
            v-model="opt.duration"
            stack-label="Duration"
          />
          <q-input
            v-model="opt.end"
            stack-label="End"
          />
          </div>
        </widget-field>

        <widget-field
          icon=""
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
            color="primary"
            @click="addField(opt)"
          />
        </widget-field>

      </div>

    <q-card-separator />
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

