<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { Unit, prettify } from '@/helpers/units';

import DialogEditBase from './DialogEditBase';

@Component
export default class UnitDialogEdit extends DialogEditBase {
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
    Dialog.create({
      component: 'UnitDialog',
      title: this.title,
      message: this.message,
      root: this.$root,
      value: this.value,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <UnitField
    :tag="tag"
    :unit-tag="unitTag"
    v-bind="tagProps"
    :class="tagClass"
    :field="value"
    tag-class="editable"
    @click="openDialog"
  />
</template>
