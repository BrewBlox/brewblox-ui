<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Unit } from '@/helpers/units';

@Component({
  props: {
    field: {
      required: true,
    },
    options: {
      type: Array,
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
    multiple: {
      type: Boolean,
      default: false,
    },
  },
})
export default class SelectPopupEdit extends Vue {
  plc = null;

  get placeholder() {
    if (this.$props.multiple && this.plc === null) {
      return [];
    }
    return this.plc;
  }

  set placeholder(v: any) {
    this.plc = v;
  }

  get displayValue() {
    if (this.$props.multiple) {
      const text = this.$props.field
        .map((v: any) => this.$props.options.find((opt: any) => opt.value === v))
        .map((v: any) => v.label)
        .join(', ');
      return text || '-';
    }
    return (this.$props.options
      .find((opt: any) => opt.value === this.$props.field)
      || { label: '-' })
      .label;
  }

  startEdit() {
    this.placeholder = this.$props.field;
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
      buttons
      persistent
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      @show="startEdit"
      @save="endEdit"
    >
      <q-select
        :multiple="$props.multiple"
        v-model="placeholder"
        :options="$props.options"
      />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
