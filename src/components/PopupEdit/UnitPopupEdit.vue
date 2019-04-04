<script lang="ts">
import { Unit } from '@/helpers/units';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    change: {
      type: Function,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'big',
    },
    unitTag: {
      type: String,
      default: 'span',
    },
  },
})
export default class UnitPopupEdit extends Vue {
  placeholder: number | null = null;

  get value() {
    if (this.placeholder === null) {
      this.placeholder = this.$props.field.val;
    }
    return this.placeholder;
  }

  set value(v: any) {
    this.placeholder = +v;
  }

  endEdit() {
    const fieldCopy = new Unit(this.placeholder, this.$props.field.unit);
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <UnitField
      :tag="$props.tag"
      :unit-tag="$props.unitTag"
      :field="$props.field"
      tag-class="editable"
    />
    <q-popup-edit
      :title="this.$props.label"
      v-model="value"
      label-set="apply"
      buttons
      persistent
      @save="endEdit"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-input
        ref="input"
        v-model="value"
        input-style="font-size: 170%"
        type="number"
        step="any"
        dark
      >
        <template v-slot:append>{{ field.notation }}</template>
      </q-input>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
