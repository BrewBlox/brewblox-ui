<script lang="ts">
import parseDuration from 'parse-duration';
import Vue from 'vue';
import Component from 'vue-class-component';

import { unitDurationString } from '@/helpers/functional';
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
  },
})
export default class TimeUnitPopupEdit extends Vue {
  $refs!: {
    input: any;
  }
  placeholder: string | null = null;
  active: boolean = false;

  get value() {
    return this.active
      ? this.placeholder
      : NaN;
  }

  set value(v: any) {
    this.placeholder = v;
  }

  onShow() {
    this.placeholder = unitDurationString(this.$props.field);
    this.active = true;
    this.$refs.input.focus();
  }

  endEdit() {
    const fieldCopy = new Unit(parseDuration(this.placeholder), 'ms');
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ this.$props.field | unitDuration }}</component>
    <q-popup-edit
      :title="this.$props.label"
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
