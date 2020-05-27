<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ListMultiSelect extends Vue {

  @Prop({ type: Array, required: true })
  public readonly value!: any[];

  @Prop({ type: Array, required: true })
  public readonly options!: any[];

  @Prop({ type: String, default: 'id' })
  public readonly optionValue!: string;

  @Prop({ type: String, default: 'title' })
  public readonly optionLabel!: string;

  @Prop({ type: Boolean, default: false })
  public readonly dense!: boolean;

  matches(val: any): boolean {
    const key = val[this.optionValue];
    return this.value.some(v => v[this.optionValue] === key);
  }

  selectValue(val: any): void {
    const key = val[this.optionValue];
    const updated = this.value.filter(v => v[this.optionValue] !== key);
    if (updated.length === this.value.length) {
      updated.push(val);
    }
    this.$emit('input', updated);
  }
}
</script>

<template>
  <div class="q-gutter-y-sm">
    <div
      v-for="opt in options"
      :key="opt[optionValue]"
      :class="[
        'col clickable q-pl-sm rounded-borders text-h6',
        {'q-py-sm': !dense, 'depth-24': matches(opt)}
      ]"
      @click="selectValue(opt)"
    >
      <slot name="body" :opt="opt">
        <div class="row q-gutter-x-sm">
          <ToggleButton :value="matches(opt)" dense />
          <div class="self-center">
            {{ opt[optionLabel] }}
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>
