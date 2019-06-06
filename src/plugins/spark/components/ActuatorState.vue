<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ActuatorState extends Vue {

  @Prop({ required: true })
  readonly field!: number;

  @Prop({ type: Function, required: true })
  readonly change!: (v: number) => void;

  @Prop({ type: Boolean, default: false })
  readonly disable!: boolean;

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

  get state() {
    return this.field;
  }

  set state(v: number) {
    // always toggle, regardless of where the element was clicked
    if (this.state === 0 || !this.known) {
      this.change(1);
    }
    if (this.state === 1) {
      this.change(0);
    }
  }

  get known() {
    return !!this.options.find(opt => opt.value === this.state);
  }
}
</script>

<template>
  <div>
    <q-btn-toggle v-if="known" v-model="state" :options="options" :disable="disable" dense/>
    <div v-else>
      <q-btn
        :disable="disable"
        class="reset-button"
        dense
        no-caps
        flat
        color="warning"
        style="padding: 0px"
        @click="state = 0"
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
