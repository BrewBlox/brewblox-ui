<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

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
  },
})
export default class ActionItem extends Vue { }
</script>

<template>
  <q-item
    v-close-popup="!$props.noClose"
    :active="$props.active"
    dark
    clickable
    @click="$emit('click')"
  >
    <q-item-section v-if="$props.icon" avatar>
      <q-icon :name="$props.icon"/>
    </q-item-section>
    <q-item-section>{{ $props.label }}</q-item-section>
    <slot/>
  </q-item>
</template>
