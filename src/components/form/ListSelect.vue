<script lang="ts">
import isObject from 'lodash/isObject';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ListSelect extends Vue {

  @Prop({ required: false })
  public readonly value!: any;

  @Prop({ type: Array, required: true })
  public readonly options!: any[];

  @Prop({ type: String, default: 'id' })
  public readonly optionValue!: string;

  @Prop({ type: String, default: 'title' })
  public readonly optionLabel!: string;

  @Prop({ type: Boolean, default: false })
  public readonly emitValue!: boolean;

  @Prop({ type: Boolean, default: false })
  public readonly dense!: boolean;

  get mappedOptions(): any[] {
    return this.options
      .map(opt => isObject(opt)
        ? opt
        : {
          [this.optionValue]: opt,
          [this.optionLabel]: opt,
        });
  }

  matches(opt: any): boolean {
    if (this.value === null) { return false; }
    return this.emitValue
      ? opt[this.optionValue] === this.value
      : opt[this.optionValue] === this.value[this.optionValue];
  }

  selectValue(opt: any, save: boolean): void {
    const value = this.emitValue ? opt[this.optionValue] : opt;
    if (save) {
      this.$emit('confirm', value);
    }
    else if (this.matches(opt)) {
      this.$emit('input', null);
    }
    else {
      this.$emit('input', value);
    }
  }
}
</script>

<template>
  <div class="q-gutter-y-sm">
    <div
      v-for="opt in mappedOptions"
      :key="opt[optionValue]"
      :class="[
        'col clickable q-pl-sm rounded-borders text-h6',
        {'q-py-sm': !dense, 'depth-24': matches(opt)}
      ]"
      @click="selectValue(opt, false)"
      @dblclick="selectValue(opt, true)"
    >
      <slot name="body" :opt="opt">
        {{ opt[optionLabel] }}
        <template v-if="opt.badge">
          <q-badge class="q-ml-sm" color="info">
            {{ opt.badge }}
          </q-badge>
        </template>
      </slot>
    </div>
  </div>
</template>
