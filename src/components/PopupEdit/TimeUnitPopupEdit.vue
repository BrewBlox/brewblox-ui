<script lang="ts">
import parseDuration from 'parse-duration';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { unitDurationString } from '@/helpers/functional';
import { Unit } from '@/helpers/units';

@Component
export default class TimeUnitPopupEdit extends Vue {
  $refs!: {
    input: any;
  }
  placeholder: string | null = null;
  active: boolean = false;

  @Prop({ type: Object, required: true })
  readonly field!: Unit;

  @Prop({ type: Function, required: true })
  readonly change!: (v: Unit) => void;

  @Prop({ type: String, required: true })
  readonly label!: string;

  @Prop({ type: String, default: 'big' })
  readonly tag!: string;

  get value() {
    return this.active
      ? this.placeholder
      : NaN;
  }

  set value(v: any) {
    this.placeholder = v;
  }

  onShow() {
    this.placeholder = unitDurationString(this.field);
    this.active = true;
    this.$refs.input.focus();
  }

  endEdit() {
    const fieldCopy = new Unit(parseDuration(this.placeholder), 'ms');
    this.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <component :is="tag" class="editable">{{ field | unitDuration }}</component>
    <q-popup-edit
      :title="label"
      v-model.lazy="value"
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
      <q-input ref="input" v-model.lazy="value" dark/>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
