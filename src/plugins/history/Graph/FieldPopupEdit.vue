<script lang="ts">
import { fetchKnownKeys } from '@/store/history/actions';
import { fieldsByMeasurement } from '@/store/history/getters';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      required: true,
    },
    measurement: {
      type: String,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class FieldPopupEdit extends Vue {
  placeholder = ''; // must not equal clear-value

  get options() {
    return (fieldsByMeasurement(this.$store, this.$props.measurement) || [])
      .map(m => ({ label: m, value: m }));
  }

  get displayValue() {
    return (this.options
      .find((opt: any) => opt.value === this.$props.field)
      || { label: '-' })
      .label;
  }

  startEdit() {
    this.placeholder = this.$props.field;
    fetchKnownKeys(this.$store);
  }

  endEdit() {
    this.$props.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <component :is="$props.display" class="editable">{{ displayValue }}</component>
    <q-popup-edit
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <q-select v-model="placeholder" :options="options" clearable/>
    </q-popup-edit>
  </div>
</template>

