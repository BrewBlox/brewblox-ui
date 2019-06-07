<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { Unit, prettify } from '@/helpers/units';

import FieldBase from './FieldBase';

@Component
export default class UnitField extends FieldBase {
  prettify = prettify;

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

  @Prop({ type: String, default: 'span' })
  public readonly unitTag!: string;

  @Emit('input')
  public change(v: Unit) {
    return v;
  }

  openDialog() {
    if (this.readonly) {
      return;
    }
    Dialog.create({
      component: 'UnitDialog',
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
    <slot name="value">{{ value.value | round }}</slot>
    <component v-if="value.value !== null" :is="unitTag" class="q-ml-xs">{{ value.notation }}</component>
    <slot/>
  </component>
</template>
