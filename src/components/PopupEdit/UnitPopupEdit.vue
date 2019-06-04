<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';

@Component({
  props: {
    field: {
      type: Object,
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
    tag: {
      type: String,
      default: 'big',
    },
    unitTag: {
      type: String,
      default: 'span',
    },
  },
})
export default class UnitPopupEdit extends Vue {
  $refs!: {
    input: any;
  }
  placeholder: number | null = null;
  active: boolean = false;

  get value() {
    return this.active
      ? this.placeholder
      : NaN;
  }

  set value(v: any) {
    this.placeholder = +v;
  }

  onShow() {
    this.placeholder = !!this.$props.field.val
      ? +this.$props.field.val.toFixed(2)
      : this.$props.field.val;
    this.active = true;
    this.$refs.input.focus();
  }

  endEdit() {
    const fieldCopy = new Unit(this.placeholder, this.$props.field.unit);
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <UnitField
      :tag="$props.tag"
      :unit-tag="$props.unitTag"
      :field="$props.field"
      tag-class="editable"
    />
    <q-popup-edit
      :title="this.$props.label"
      v-model="value"
      label-set="apply"
      buttons
      persistent
      @show="onShow"
      @hide="active = false"
      @save="endEdit"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-input
        ref="input"
        v-model="value"
        input-style="font-size: 170%"
        type="number"
        step="any"
        dark
      >
        <template v-slot:append>{{ field.notation }}</template>
      </q-input>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
