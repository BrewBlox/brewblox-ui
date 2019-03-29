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
    tag: {
      type: String,
      default: 'big',
    },
  },
})
export default class InputPopupEdit extends Vue {
  placeholder = NaN; // must not equal clear-value
  $refs!: {
    input: any;
  }

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
    // this.$nextTick(() => this.$refs.input.select());
  }

  endEdit() {
    this.$props.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <component
      :disabled="$props.disable"
      :is="$props.tag"
      class="editable ellipsis"
    >{{ displayValue }}</component>
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
      <q-input
        ref="input"
        :clearable="$props.clearable"
        :type="$props.type"
        v-model="placeholder"
        step="any"
        dark
      />
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
