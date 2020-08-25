<script lang="ts">
import { Enum } from 'typescript-string-enums';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { DigitalState } from '@/plugins/spark/types';

const alternatives: Record<number | string, DigitalState> = {
  0: DigitalState.STATE_INACTIVE,
  1: DigitalState.STATE_ACTIVE,
  2: DigitalState.STATE_UNKNOWN,
  Active: DigitalState.STATE_ACTIVE,
  Inactive: DigitalState.STATE_INACTIVE,
  Unknown: DigitalState.STATE_UNKNOWN,
};

@Component
export default class DigitalStateButton extends Vue {
  on: DigitalState = DigitalState.STATE_ACTIVE;
  off: DigitalState = DigitalState.STATE_INACTIVE;

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
    return Enum.isType(DigitalState, this.value)
      ? this.value
      : alternatives[this.value] ?? DigitalState.STATE_UNKNOWN;
  }

  set state(v: DigitalState) {
    this.$emit('input', v);
  }

  get known(): boolean {
    return this.state in DigitalState;
  }

  toggle(): void {
    if (this.disable) {
      return;
    }
    this.state = this.state === this.off
      ? DigitalState.STATE_ACTIVE
      : DigitalState.STATE_INACTIVE;
  }
}
</script>

<template>
  <q-btn-toggle
    v-if="known"
    v-bind="{options, disable, ...$attrs}"
    :value="state"
    :class="['shadow-1', $attrs.class]"
    dense
    unelevated
    @click.native="toggle"
  >
    <template #off>
      <span class="row">
        <q-tooltip v-if="pending && pendingReason">State pending: {{ pendingReason }}</q-tooltip>
        <q-spinner v-if="pending && state === off" />
        <span v-else>Off</span>
      </span>
    </template>
    <template #on>
      <span class="row">
        <q-tooltip v-if="pending && pendingReason">State pending: {{ pendingReason }}</q-tooltip>
        <q-spinner v-if="pending && state === on" />
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
