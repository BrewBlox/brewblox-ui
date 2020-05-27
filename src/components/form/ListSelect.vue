<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component
export default class ListSelect extends Vue {

  @Prop({ type: Object, required: false })
  public readonly value!: any;

  @Prop({ type: Array, required: true })
  public readonly options!: any[];

  @Prop({ type: String, default: 'id' })
  public readonly optionValue!: string;

  @Prop({ type: String, default: 'title' })
  public readonly optionLabel!: string;

  matches(val: any): boolean {
    return this.value !== null
      && this.value[this.optionValue] === val[this.optionValue];
  }

  selectValue(value: any, save: boolean): void {
    if (save) {
      this.$emit('confirm', value);
    }
    else if (this.matches(value)) {
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
      v-for="opt in options"
      :key="opt[optionValue]"
      :class="[
        'col clickable q-pa-sm rounded-borders text-h6',
        matches(opt) && 'depth-24',
      ]"
      @click="selectValue(opt, false)"
      @dblclick="selectValue(opt, true)"
    >
      <slot name="body" :opt="opt">
        {{ opt[optionLabel] }}
      </slot>
    </div>
  </div>
</template>
