<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component
export default class ActuatorState extends Vue {

  @Prop({ required: true })
  readonly value!: number;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

  @Emit('input')
  change(val: number) {
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
        value: 0,
      },
      {
        ...this.commonOpts,
        toggleTextColor: 'white',
        label: 'On',
        value: 1,
      },
    ];
  }

  get known() {
    return !!this.options.find(opt => opt.value === this.value);
  }

  toggle() {
    if (this.value === 0 || !this.known) {
      this.change(1);
    }
    if (this.value === 1) {
      this.change(0);
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
