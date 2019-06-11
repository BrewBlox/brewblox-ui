<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { ActuatorState } from '../types';

@Component
export default class ActuatorField extends Vue {

  @Prop({ required: true })
  readonly value!: number;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

  @Emit('input')
  change(val: ActuatorState) {
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
        value: ActuatorState.Inactive,
      },
      {
        ...this.commonOpts,
        toggleTextColor: 'white',
        label: 'On',
        value: ActuatorState.Active,
      },
    ];
  }

  get known() {
    return !!this.options.find(opt => opt.value === this.value);
  }

  toggle() {
    if (this.disable) {
      return;
    }
    if (this.value === ActuatorState.Inactive || !this.known) {
      this.change(ActuatorState.Active);
    } else if (this.value === ActuatorState.Active) {
      this.change(ActuatorState.Inactive);
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
  </div>
</template>

<style>
</style>
