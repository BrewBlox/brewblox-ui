<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
  props: {
    field: {
      type: String,
      required: false,
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
export default class ColorPickerPopupEdit extends Vue {
  placeholder: string = '';
  active: boolean = false;

  get value(): string {
    return this.active
      ? this.placeholder
      : '';
  }

  set value(v: string) {
    this.placeholder = v;
  }

  get colorString() {
    return this.$props.field || '<not set>';
  }

  get colorStyle() {
    let color = this.$props.field || 'ffffff';
    if (!color.startsWith('#')) {
      color = `#${color}`;
    }
    return {
      color,
      backgroundColor: color,
    };
  }

  startEdit() {
    this.placeholder = this.colorStyle.color;
    this.active = true;
  }

  save() {
    this.$props.change(this.placeholder.replace('#', ''));
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable">{{ colorString }}</component>
    <component :is="$props.tag" :style="colorStyle">[ ]</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="$props.label"
      v-model="value"
      label-set="apply"
      buttons
      persistent
      @show="startEdit"
      @hide="active = false"
      @save="save"
    >
      <div class="help-text text-weight-light q-my-md">
        <slot/>
      </div>
      <q-color v-model="value" dark no-parent-field format-model="hex"/>
    </q-popup-edit>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
