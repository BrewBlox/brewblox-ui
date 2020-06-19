<script lang="ts">
import isNumber from 'lodash/isNumber';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { DigitalState } from '@/plugins/spark/types';

const numberValues: Record<number, DigitalState> = {
  0: 'Inactive',
  1: 'Active',
  2: 'Unknown',
};

@Component
export default class DigitalStateButton extends Vue {
  on: DigitalState = 'Active';
  off: DigitalState = 'Inactive';

  commonOpts = {
    color: 'grey-9',
    toggleColor: 'primary',
    textColor: 'grey',
    toggleTextColor: 'white',
  };
  options = [
    {
      ...this.commonOpts,
      value: this.off,
      slot: 'off',
    },
    {
      ...this.commonOpts,
      value: this.on,
      slot: 'on',
    },
  ];

  @Prop({ type: [String, Number], required: true })
  readonly value!: DigitalState | number;

  @Prop({ type: Boolean, default: false })
  public readonly pending!: boolean;

  @Prop({ type: String })
  public readonly pendingReason!: string;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

  get state(): DigitalState {
    return isNumber(this.value)
      ? numberValues[this.value] ?? 'Unknown'
      : this.value;
  }

  set state(v: DigitalState) {
    this.$emit('input', v);
  }

  get known(): boolean {
    return [this.on, this.off].includes(this.state);
  }

  toggle(): void {
    if (this.disable) {
      return;
    }
    this.state = this.state === this.off
      ? 'Active'
      : 'Inactive';
  }
}
</script>

<template>
  <!-- TODO: replace @click.native with @click when bug is fixed in quasar -->
  <!-- https://github.com/quasarframework/quasar/issues/7150 -->
  <q-btn-toggle
    v-if="known"
    v-bind="{value, options, disable, ...$attrs}"
    :class="['shadow-1', $attrs.class]"
    dense
    unelevated
    @click.native="toggle"
  >
    <template #off>
      <span class="row">
        <q-tooltip v-if="pending && pendingReason">State pending: {{ pendingReason }}</q-tooltip>
        <q-spinner v-if="pending && value === off" />
        <span v-else>Off</span>
      </span>
    </template>
    <template #on>
      <span class="row">
        <q-tooltip v-if="pending && pendingReason">State pending: {{ pendingReason }}</q-tooltip>
        <q-spinner v-if="pending && value === on" />
        <span v-else>On</span>
      </span>
    </template>
  </q-btn-toggle>
  <q-btn
    v-else
    :disable="disable"
    class="reset-button"
    dense
    no-caps
    flat
    color="warning"
    style="padding: 0px"
    @click="toggle"
  >
    Unknown state!
    <q-tooltip>
      Click to try to set to
      <i>inactive</i>
    </q-tooltip>
  </q-btn>
</template>
