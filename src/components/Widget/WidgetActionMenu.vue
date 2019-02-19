<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';


@Component({
  props: {
    itemId: {
      type: String,
      required: true,
    },
    onCopy: {
      type: Function,
      required: false,
    },
    onMove: {
      type: Function,
      required: false,
    },
    onDelete: {
      type: Function,
      required: false,
    },
  },
})
export default class WidgetActionMenu extends Vue { }
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>{{ $props.itemId }} Menu</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <div class="row justify-around" style="margin-top: 20px">
      <q-btn
        v-close-overlay
        v-if="$props.onCopy"
        flat
        size="lg"
        icon="file_copy"
        label="Copy"
        @click="$props.onCopy"
      />
      <q-btn
        v-close-overlay
        v-if="$props.onMove"
        flat
        size="lg"
        icon="exit_to_app"
        label="Move"
        @click="$props.onMove"
      />
      <q-btn
        v-close-overlay
        v-if="$props.onDelete"
        flat
        size="lg"
        icon="delete"
        label="Delete"
        @click="$props.onDelete"
      />
    </div>
  </div>
</template>
