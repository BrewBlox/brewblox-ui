<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import FieldBase from '@/components/FieldBase';
import { round } from '@/helpers/functional';


@Component
export default class LabeledField extends FieldBase {

  @Prop({ default: null })
  public readonly value!: any;

  @Prop({ type: Boolean, default: false })
  public readonly number!: boolean;

  @Prop({ type: String, required: false })
  public readonly suffix!: string;

  @Prop({ type: Number, default: 2 })
  readonly decimals!: number;

  @Prop({ type: Boolean, default: true })
  public readonly readonly!: boolean;

  get displayValue(): string | number {
    if (this.$slots.control || this.$slots.default) {
      return ''; // parent has custom implementation
    }
    if ((this.value ?? '') === '') {
      return '<not set>';
    }
    return this.number
      ? round(this.value, this.decimals)
      : this.value;
  }

  get activeSlots(): string[] {
    return this.fieldSlots.filter(s => !!this.$slots[s]);
  }
}
</script>

<template>
  <q-field
    :label="label"
    :class="[{pointer: !readonly}, $attrs.class]"
    :borderless="readonly"
    v-bind="$attrs"
    stack-label
    @click.native="$emit('click')"
  >
    <template #control>
      <slot name="control">
        <component :is="tag" :class="['q-mt-sm', tagClass]">
          <slot>
            {{ displayValue }}
          </slot>
          <small v-if="!!suffix" class="q-ml-xs darkish">{{ suffix }}</small>
        </component>
      </slot>
    </template>

    <template v-for="slot in activeSlots">
      <template :slot="slot">
        <slot :name="slot" />
      </template>
    </template>
  </q-field>
</template>
