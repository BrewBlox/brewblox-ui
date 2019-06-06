<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import DialogEditBase from '@/components/DialogEdit/DialogEditBase';
import { Link } from '@/helpers/units';
import { Block } from '@/plugins/spark/types';

@Component
export default class LinkDialogEdit extends DialogEditBase {

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
    Dialog.create({
      component: 'LinkDialog',
      title: this.title,
      message: this.message,
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
  <component :is="tag" v-bind="tagProps" :class="tagClass" class="editable" @click="openDialog">
    <slot name="pre"/>
    <slot name="value">{{ value | truncated }}</slot>
    <slot/>
  </component>
</template>
