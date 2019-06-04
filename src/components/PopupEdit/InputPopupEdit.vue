<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { round, truncate } from '@/helpers/functional';

@Component
export default class InputPopupEdit extends Vue {
  $refs!: {
    input: any;
  }
  placeholder: any = null;
  active: boolean = false;

  @Prop({ required: true })
  readonly field!: any;

  @Prop({ type: Function, required: true })
  readonly change!: (v: any) => void;

  @Prop({ type: String, required: true })
  readonly label!: string;

  @Prop({ type: String, default: 'text' })
  readonly type!: string;

  @Prop({ type: Boolean, default: false })
  readonly clearable!: boolean;

  @Prop({ type: String, default: 'big' })
  readonly tag!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: Object, default: () => ({}) })
  readonly popupProps!: any;

  @Prop({ type: Object, default: () => ({}) })
  readonly inputProps!: any;

  get value() {
    return this.active
      ? this.placeholder
      : NaN;
  }

  set value(v: any) {
    this.placeholder = this.type === 'number' ? +v : v;
  }

  get displayValue() {
    const val = this.field;

    if (this.type === 'number') {
      return round(val, this.decimals);
    }

    if (this.type === 'text') {
      if (val === null || val === undefined || val === '') {
        return '<not set>';
      }
      return truncate(val);
    }

    return val;
  }

  onShow() {
    this.placeholder = this.field;
    this.active = true;
    this.$refs.input.focus();
  }

  save() {
    this.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <component :disabled="$attrs.disabled" :is="tag" class="editable ellipsis">{{ displayValue }}</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="label"
      v-model="value"
      v-bind="popupProps"
      label-set="apply"
      buttons
      persistent
      @show="onShow"
      @hide="active = false"
      @save="save"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-input
        ref="input"
        :clearable="clearable"
        :type="type"
        v-bind="inputProps"
        v-model="value"
        step="any"
        dark
        autofocus
        input-style="font-size: 170%"
      />
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
