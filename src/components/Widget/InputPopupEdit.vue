<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

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
    display: {
      type: String,
      default: 'big',
    },
  },
})
export default class InputPopupEdit extends Vue {
  placeholder = NaN; // must not equal clear-value

  get displayValue() {
    const val = this.$props.field;
    if (val === null || val === undefined || val === '') {
      return '<not set>';
    }
    return val;
  }

  get popupTitle() {
    return `Set ${this.$props.label} to:`;
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
    <component
      :disabled="$props.disable"
      :is="$props.display"
      class="editable"
    >{{ displayValue | round | truncated }}</component>
    <q-popup-edit
      :disable="$attrs.disabled"
      :title="popupTitle"
      v-model="placeholder"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <q-input :clearable="$props.clearable" :type="$props.type" v-model="placeholder"/>
    </q-popup-edit>
  </div>
</template>

