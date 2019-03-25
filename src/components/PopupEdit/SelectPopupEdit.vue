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
    tag: {
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

  endEdit(v: any) {
    this.placeholder = v;
    this.$props.change(this.placeholder);
  }
}
</script>

<template>
  <div>
    <component :is="$props.tag" class="editable clickable" @click="startEdit">
      {{ displayValue | truncated }}
      <q-menu>
        <q-item dark>
          <q-item-section class="help-text text-weight-light">
            <big>{{ $props.label }}</big>
            <slot/>
          </q-item-section>
        </q-item>
        <q-item v-if="$props.clearable" dark>
          <q-item-section>
            <q-btn icon="clear" label="clear" flat @click="endEdit(null)" v-close-popup/>
          </q-item-section>
        </q-item>
        <q-separator dark inset/>
        <q-item
          v-for="opt in $props.options"
          :key="String(opt.value)"
          :active="opt.value === placeholder"
          clickable
          dark
          v-close-popup
          @click="endEdit(opt.value)"
        >
          <q-item-section>{{ opt.label }}</q-item-section>
        </q-item>
      </q-menu>
    </component>
  </div>
</template>

<style lang="stylus" scoped>
@import './popups.styl';
</style>
