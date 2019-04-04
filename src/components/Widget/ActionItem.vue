<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

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
  },
})
export default class ActionItem extends Vue { }
</script>

<template>
  <q-item v-close-popup dark clickable @click="$emit('click')">
    <q-item-section v-if="$props.icon" avatar>
      <q-icon :name="$props.icon"/>
    </q-item-section>
    <q-item-section>{{ $props.label }}</q-item-section>
    <slot/>
  </q-item>
</template>
