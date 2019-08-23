<script lang="ts">
import { Dialog } from 'quasar';
import { Component, Emit, Prop } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';

import FieldBase from './FieldBase';

@Component
export default class GroupsField extends FieldBase {

  @Prop({ type: Array, required: true })
  public readonly value!: string[];

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  get groupNames() {
    return sparkStore.groupNames(this.serviceId);
  }

  get displayValue() {
    const actual = this.value
      .map(groupIdx => this.groupNames[groupIdx])
      .filter(name => name !== undefined)
      .join(', ');
    return actual || '<Click to set>';
  }

  @Emit('input')
  public change(v: string[]) {
    return v;
  }

  openDialog() {
    if (this.readonly) {
      return;
    }

    Dialog.create({
      title: this.title,
      message: this.message,
      dark: true,
      cancel: true,
      options: {
        type: 'checkbox',
        model: [...this.value],
        items: this.groupNames.map((p, idx) => ({ label: p, value: idx })),
      },
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
    <slot name="pre" />
    <slot name="value">
      {{ displayValue }}
    </slot>
    <slot />
  </component>
</template>
