<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { DigitalState } from '@/plugins/spark/types';

@Component
export default class DigitalStateField extends Vue {

  @Prop({ type: Number, required: true })
  readonly value!: DigitalState;

  @Prop({ type: Number, default: null })
  readonly actualValue!: DigitalState;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

  @Emit('input')
  change(val: DigitalState) {
    return val;
  }

  get commonOpts() {
    return {
      color: 'grey-9',
      toggleColor: 'primary',
      textColor: 'grey',
    };
  }

  get options() {
    return [
      {
        ...this.commonOpts,
        toggleTextColor: 'white',
        label: 'Off',
        value: DigitalState.Inactive,
      },
      {
        ...this.commonOpts,
        toggleTextColor: 'white',
        label: 'On',
        value: DigitalState.Active,
      },
    ];
  }

  get known() {
    return !!this.options.find(opt => opt.value === this.value);
  }

  get mismatch() {
    return !this.disable
      && this.actualValue !== null
      && this.value !== this.actualValue;
  }

  toggle() {
    if (this.disable) {
      return;
    }
    if (this.value === DigitalState.Inactive) {
      this.change(DigitalState.Active);
    } else if (this.value === DigitalState.Active || !this.known) {
      this.change(DigitalState.Inactive);
    }
  }
}
</script>

<template>
  <div>
    <q-btn-toggle
      v-if="known"
      :value="value"
      :options="options"
      :disable="disable"
      dense
      @click="toggle"
    />
    <div v-else>
      <q-btn
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
    </div>
    <q-spinner v-if="mismatch"/>
  </div>
</template>

<style>
</style>
