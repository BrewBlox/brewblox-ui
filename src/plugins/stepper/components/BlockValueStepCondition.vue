<script lang="ts">
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { CompareOperator } from '../types';

interface Opts {
  block: string;
  service: string;
  key: string;
  operator: CompareOperator;
  value: any;
}


@Component
export default class BlockValueStepCondition extends Vue {
  @Prop({ type: String, required: true })
  public readonly type!: string;

  @Prop({ type: Object, required: true })
  public readonly opts!: Opts;

  @Emit('update:opts')
  saveOpts(opts: Opts): Opts {
    return opts;
  }
}
</script>

<template>
  <div />
</template>
