<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { round } from '@/helpers/functional';


@Component
export default class InputField extends FieldBase {

  @Prop({ type: [String, Number] })
  public readonly value!: string | number;

  @Prop({ type: Boolean, default: false })
  public readonly number!: boolean;

  @Prop({ type: String, default: 'value' })
  public readonly label!: string;

  @Prop({ type: String, required: false })
  public readonly suffix!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: [String, Object, Array], default: '' })
  public readonly tagClass!: any;

  get displayValue(): string | number {
    if (this.value === ''
      || this.value === null
      || this.value === undefined) {
      return '<not set>';
    }

    return this.number
      ? round(this.value, this.decimals)
      : this.value;
  }
}
</script>

<template>
  <q-field
    :label="label"
    :class="$attrs.class"
    v-bind="$attrs"
    stack-label
    borderless
  >
    <template v-if="!!$scopedSlots.before" #before>
      <slot name="before" />
    </template>
    <template #control>
      <component :is="tag" :class="['q-mt-sm', tagClass]">
        <slot>
          {{ displayValue }}
        </slot>
        <small v-if="!!suffix" class="q-ml-xs darkish">{{ suffix }}</small>
      </component>
    </template>
    <template v-if="!!$scopedSlots.after" #after>
      <slot name="after" />
    </template>
  </q-field>
</template>
