<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

@Component({
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
})
export default class WidgetToolbar extends Vue { }
</script>

<template>
  <q-card-section class="q-pa-xs">
    <q-item dark>
      <q-item-section>
        <q-item-label class="ellipsis text-h6">{{ $props.title}}</q-item-label>
        <q-item-label caption class="ellipsis">{{ $props.subtitle }}</q-item-label>
      </q-item-section>
      <slot/>
    </q-item>
    <q-separator dark inset/>
  </q-card-section>
</template>
