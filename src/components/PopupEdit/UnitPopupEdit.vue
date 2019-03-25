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
  },
})
export default class UnitPopupEdit extends Vue {
  placeholder = NaN; // must not equal clear-value
  $refs!: {
    input: any;
  }

  get notation() {
    return this.$props.field.notation;
  }

  get initialValue() {
    return this.$props.field.value;
  }

  startEdit() {
    this.placeholder = this.initialValue;
  }

  endEdit() {
    const fieldCopy = new Unit(this.placeholder, this.$props.field.unit);
    this.$props.change(fieldCopy);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ this.$props.field | unit }}</component>
    <q-popup-edit
      :title="this.$props.label"
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-input ref="input" :suffix="notation" v-model="placeholder" type="number" step="any" dark/>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
