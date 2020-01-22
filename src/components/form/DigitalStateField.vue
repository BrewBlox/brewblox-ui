<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { DigitalState } from '@/plugins/spark/types';

@Component
export default class DigitalStateField extends Vue {
  on = DigitalState.Active;
  off = DigitalState.Inactive;

  @Prop({ type: Number, required: true })
  readonly value!: DigitalState;

  @Prop({ type: Boolean, default: false })
  public readonly pending!: boolean;

  @Prop({ type: String })
  public readonly pendingReason!: string;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

  @Emit('input')
  change(val: DigitalState): DigitalState {
    return val;
  }

  get commonOpts(): Mapped<string> {
    return {
      color: 'grey-9',
      toggleColor: 'primary',
      textColor: 'grey',
      toggleTextColor: 'white',
    };
  }

  get options(): Mapped<any> {
    return [
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
  }

  get known(): boolean {
    return !!this.options.find(opt => opt.value === this.value);
  }

  toggle(): void {
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
  <LabeledField v-bind="{...$attrs, ...$props, readonly: true}">
    <q-btn-toggle
      v-if="known"
      :value="value"
      :options="options"
      :disable="disable"
      dense
      unelevated
      class="depth-1"
      @click="toggle"
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
  </LabeledField>
</template>
