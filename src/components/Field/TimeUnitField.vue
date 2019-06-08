<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';

import FieldBase from './FieldBase';

@Component
export default class TimeUnitField extends FieldBase {

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

  @Emit('input')
  public change(v: Unit) {
    return v;
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'TimeUnitDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      root: this.$root,
      value: this.value,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <component
    :is="tag"
    v-bind="tagProps"
    :class="[{editable: !readonly}, tagClass]"
    @click="openDialog"
  >
    <slot name="pre"/>
    <slot name="value">{{ value | unitDuration }}</slot>
    <slot/>
  </component>
</template>
