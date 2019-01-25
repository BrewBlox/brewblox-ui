<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

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
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class ColorPickerPopupEdit extends Vue {
  placeholder = ''; // must not equal clear-value

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
    this.placeholder = this.$props.field;
  }

  endEdit() {
    this.$props.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <component :is="$props.display" class="editable">{{ colorString }}</component>
    <component :is="$props.display" :style="colorStyle">[ ]</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="$props.label"
      v-model="placeholder"
      label-set="apply"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <div class="text-weight-light q-my-md">
        <slot/>
      </div>
      <q-color-picker v-model="placeholder" dark no-parent-field format-model="hex"/>
    </q-popup-edit>
  </div>
</template>

