<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    field: {
      required: true,
    },
    options: {
      type: Array,
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
    display: {
      type: String,
      default: 'big',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
  },
})
export default class SelectPopupEdit extends Vue {
  plc = NaN;

  get placeholder() {
    // Ensures that value always changes during edit
    // Placeholder must not equal clear-value
    if (Number.isNaN(this.plc)) {
      return this.$props.multiple
        ? [undefined]
        : undefined;
    }
    return this.plc;
  }

  set placeholder(v: any) {
    this.plc = v;
  }

  get displayValue() {
    if (this.$props.multiple) {
      const text = this.$props.field
        .map((v: any) => this.$props.options.find((opt: any) => opt.value === v))
        .map((v: any) => v.label)
        .join(', ');
      return text || 'Click to set';
    }
    return (this.$props.options
      .find((opt: any) => opt.value === this.$props.field)
      || { label: 'Click to set' })
      .label;
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
    <component :is="$props.display" class="editable">{{ displayValue | truncated }}</component>
    <q-popup-edit
      :title="`Set ${this.$props.label} to:`"
      v-model="placeholder"
      buttons
      persistent
      @show="startEdit"
      @save="endEdit"
    >
      <q-select
        :multiple="$props.multiple"
        :clearable="$props.clearable"
        :options="$props.options"
        v-model="placeholder"
      />
    </q-popup-edit>
  </div>
</template>

<style scoped>
</style>
