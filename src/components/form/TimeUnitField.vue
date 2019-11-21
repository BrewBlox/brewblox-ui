<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { Unit } from '@/helpers/units';

@Component
export default class TimeUnitField extends FieldBase {

  @Prop({ type: Object, required: true, validator: v => v instanceof Unit })
  public readonly value!: Unit;

  @Prop({ type: String, default: 'duration' })
  public readonly label!: string;

  @Emit('input')
  public change(v: Unit): Unit {
    return v;
  }

  openDialog(): void {
    if (this.readonly) {
      return;
    }

    createDialog({
      component: 'TimeUnitDialog',
      title: this.title,
      message: this.message,
      messageHtml: this.messageHtml,
      parent: this,
      value: this.value,
      label: this.label,
      rules: this.rules,
    })
      .onOk(this.change);
  }
}
</script>

<template>
  <q-field
    :label="label"
    :class="[{pointer: !readonly}, $attrs.class]"
    v-bind="$attrs"
    stack-label
    @click.native="openDialog"
  >
    <template #control>
      <component :is="tag" class="q-mt-sm">
        <slot name="value">
          {{ value | unitDuration }}
        </slot>
      </component>
    </template>
  </q-field>
</template>
