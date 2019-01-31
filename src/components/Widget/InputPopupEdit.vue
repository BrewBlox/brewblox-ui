<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { round, truncate } from '@/helpers/functional';

@Component({
  props: {
    field: {
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
    type: {
      type: String,
      default: 'text',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class InputPopupEdit extends Vue {
  placeholder = NaN; // must not equal clear-value

  get displayValue() {
    const val = this.$props.field;

    if (this.$props.type === 'number') {
      return round(val);
    }

    if (this.$props.type === 'text') {
      if (val === null || val === undefined || val === '') {
        return '<not set>';
      }
      return truncate(val);
    }

    return val;
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
    <component :disabled="$props.disable" :is="$props.display" class="editable">{{ displayValue }}</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="$props.label"
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-input :clearable="$props.clearable" :type="$props.type" v-model="placeholder"/>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
