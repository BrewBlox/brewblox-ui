<script lang="ts">
import { Component, Emit, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { createDialog } from '@/helpers/dialog';
import { round } from '@/helpers/functional';


@Component
export default class InputField extends FieldBase {

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: String, default: 'text' })
  public readonly type!: string;

  @Prop({ type: String, default: 'value' })
  public readonly label!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  get displayValue(): string | number {
    if (this.value === ''
      || this.value === null
      || this.value === undefined) {
      return '<not set>';
    }

    return this.type === 'number'
      ? round(this.value, this.decimals)
      : this.value;
  }
}
</script>

<template>
  <q-field
    :label="label"
    :class="$attrs.class"
    stack-label
    borderless
    readonly
  >
    <template #control>
      <component :is="tag" class="q-mt-sm">
        <slot>
          {{ displayValue }}
        </slot>
      </component>
    </template>
  </q-field>
  <!-- <component
    :is="tag"
    v-bind="tagProps"
    :class="[{editable: !readonly}, tagClass]"
    @click="openDialog"
  >
    <slot name="pre" />
    <slot name="value">
      {{ displayValue }}
    </slot>
    <slot name="append" />
    <q-tooltip v-if="!readonly">
      Set {{ label }}
    </q-tooltip>
  </component> -->
</template>
