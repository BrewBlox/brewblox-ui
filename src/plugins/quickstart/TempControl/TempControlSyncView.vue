<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { PidConfig } from '../types';
import TempControlPidView from './TempControlPidView.vue';

@Component({
  components: {
    TempControlPidView,
  },
})
export default class TempControlSyncView extends Vue {

  @Prop({ type: Object, required: true })
  public readonly blockConfig!: PidConfig;

  @Prop({ type: Object, required: true })
  public readonly modeConfig!: PidConfig;

  apply(leading: 'pid' | 'mode'): void {
    this.$emit('apply', leading);
  }

}
</script>

<template>
  <div
    class="row q-ma-md q-mt-lg q-gutter-sm q-pr-sm q-pb-sm"
  >
    <q-icon
      name="warning"
      color="warning"
      size="lg"
      class="col-auto"
    />
    <div class="q-px-sm q-mb-none col">
      <slot name="message" />
    </div>

    <div class="col-break" />

    <LabeledField
      label="Active settings (block)"
      class="col-grow bordered"
    >
      <TempControlPidView
        :value="blockConfig"
        class="column"
      />
    </LabeledField>
    <div class="column col-auto justify-center">
      <q-btn
        flat
        icon="mdi-arrow-left"
        label="Apply"
        stack
        @click="apply('mode')"
      />
      <q-btn
        flat
        icon="mdi-arrow-right"
        label="Store"
        stack
        @click="apply('pid')"
      />
    </div>
    <LabeledField
      label="Stored settings (mode)"
      class="col-grow bordered"
    >
      <TempControlPidView
        :value="modeConfig"
        class="column"
      />
    </LabeledField>
  </div>
</template>
