<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';

@Component
export default class UnitPopupEdit extends Vue {
  $refs!: {
    input: any;
  }

  @Prop({ type: Object, required: true })
  readonly field!: Unit;

  @Prop({ type: Function, required: true })
  readonly change!: (v: Unit) => void;

  @Prop({ type: String, required: true })
  readonly label!: string;

  @Prop({ type: String, default: 'big' })
  readonly tag!: string;

  @Prop({ type: String, default: 'span' })
  readonly unitTag!: string;

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
    this.placeholder = !!this.field.value
      ? +this.field.value.toFixed(2)
      : this.field.value;
    this.active = true;
    this.$refs.input.focus();
  }

  endEdit() {
    const fieldCopy = new Unit(this.placeholder, this.field.unit);
    this.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <UnitField :tag="tag" :unit-tag="unitTag" :field="field" tag-class="editable"/>
    <q-popup-edit
      :title="label"
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
