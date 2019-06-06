<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Unit } from '../helpers/units';

@Component
export default class UnitField extends Vue {

  @Prop({ type: Object, required: true })
  readonly field!: Unit;

  @Prop({ type: String, default: 'big' })
  readonly tag!: string;

  @Prop({ type: String, default: '' })
  readonly tagClass!: string;

  @Prop({ type: String, default: 'span' })
  readonly unitTag!: string;
}
</script>

<template>
  <div v-on="$listeners">
    <component :is="tag" :class="tagClass">{{ field.value | round }}</component>
    <component v-if="field.value !== null" :is="unitTag" class="q-ml-xs">{{ field.notation }}</component>
  </div>
</template>
