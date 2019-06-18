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

  @Prop({ type: String })
  public readonly label!: string;

  @Prop({ type: Function, default: null })
  readonly filter!: (block: Block) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  @Emit('input')
  public change(v: Link) {
    return v;
  }

  get displayValue() {
    return this.value.id || 'click to assign';
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      component: 'LinkDialog',
      root: this.$root,
      clearable: true,
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      filter: this.filter,
      value: this.value,
      serviceId: this.serviceId,
      label: this.label,
      noCreate: this.noCreate,
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
    <slot name="value">{{ displayValue | truncated }}</slot>
    <slot/>
  </component>
</template>
