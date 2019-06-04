<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class ColorPickerPopupEdit extends Vue {
  placeholder: string = '';
  active: boolean = false;

  @Prop({ type: String, required: false })
  readonly field!: string;

  @Prop({ type: Function, required: true })
  readonly change!: (val: string) => void;

  @Prop({ type: String, required: false })
  readonly label!: string;

  @Prop({ type: String, default: 'big' })
  readonly tag!: string;

  get value(): string {
    return this.active
      ? this.placeholder
      : '';
  }

  set value(v: string) {
    this.placeholder = v;
  }

  get colorString() {
    return this.field || '<not set>';
  }

  get colorStyle() {
    let color = this.field || 'ffffff';
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
    this.change(this.placeholder.replace('#', ''));
  }
}
</script>

<template>
  <div>
    <component :is="tag" class="editable">{{ colorString }}</component>
    <component :is="tag" :style="colorStyle">[ ]</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="label"
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
