<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/Field/FieldBase';
import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

@Component
export default class LinkField extends FieldBase {

  @Prop({ type: Object, required: true, validator: v => v instanceof Link })
  public readonly value!: Link;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: Function, default: null })
  readonly filter!: (block: Block) => boolean;

  @Emit('input')
  public change(v: Link) {
    return v;
  }

  get displayValue() {
    return this.value || 'click to assign';
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'LinkDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      filter: this.filter,
      root: this.$root,
      value: this.value,
      serviceId: this.serviceId,
      clearable: true,
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
    <slot name="value">{{ value | truncated }}</slot>
    <slot/>
  </component>
</template>
