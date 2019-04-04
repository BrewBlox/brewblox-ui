<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { round, truncate } from '@/helpers/functional';

@Component({
  props: {
    field: {
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
    type: {
      type: String,
      default: 'text',
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: 'big',
    },
  },
})
export default class InputPopupEdit extends Vue {
  placeholder: any = null;
  get value() {
    if (this.placeholder === null) {
      this.placeholder = this.$props.field;
    }
    return this.placeholder;
  }
  set value(v: any) {
    this.placeholder = this.$props.type === 'number' ? +v : v;
  }

  $refs!: {
    input: any;
  }

  get displayValue() {
    const val = this.$props.field;

    if (this.$props.type === 'number') {
      return round(val);
    }

    if (this.$props.type === 'text') {
      if (val === null || val === undefined || val === '') {
        return '<not set>';
      }
      return truncate(val);
    }

    return val;
  }

  endEdit() {
    this.$props.change(this.value);
  }
}
</script>

<template>
  <div>
    <component
      :disabled="$props.disable"
      :is="$props.tag"
      class="editable ellipsis"
    >{{ displayValue }}</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="$props.label"
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
        :clearable="$props.clearable"
        :type="$props.type"
        v-model="value"
        step="any"
        dark
        autofocus
        input-style="font-size: 170%"
      />
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
