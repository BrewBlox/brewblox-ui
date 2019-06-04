<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
  props: {
    label: {
      type: String,
      required: false,
    },
    icon: {
      type: String,
      required: false,
    },
    active: {
      type: Boolean,
      default: false,
    },
    noClose: {
      type: Boolean,
      default: false,
    },
    itemProps: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
})
export default class ActionItem extends Vue {
  get combinedProps() {
    return {
      dark: true,
      clickable: !this.$props.disabled,
      active: this.$props.active && !this.$props.disabled,
      ...this.$props.itemProps,
    };
  }

  get itemClass() {
    return {
      darkened: this.$props.disabled,
    };
  }

  onClick() {
    if (!this.$props.disabled) {
      this.$emit('click');
    }
  }
}
</script>

<template>
  <q-item
    v-close-popup="!noClose && !disabled"
    v-bind="combinedProps"
    :class="itemClass"
    @click="onClick"
  >
    <q-item-section v-if="$props.icon" avatar>
      <q-icon :name="$props.icon"/>
    </q-item-section>
    <q-item-section>{{ $props.label }}</q-item-section>
    <slot/>
  </q-item>
</template>
