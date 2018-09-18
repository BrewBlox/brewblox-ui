<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';

/* eslint-disable indent */
@Component({
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    onClose: {
      type: Function,
      required: true,
    },
  },
})
/* eslint-enable */
export default class WidgetModal extends Vue {
  get childOpen() {
    return this.$props.isOpen;
  }

  set childOpen(val: boolean) {
    if (!val) {
      this.$props.onClose();
    }
  }
}
</script>

<template>
  <q-modal
    v-model="childOpen"
    :content-css="{ minWidth: '80vw', minHeight: '80vh' }"
  >
    <q-modal-layout>

      <q-toolbar
        slot="header"
        color="dark-bright"
      >
        <q-toolbar-title>
          {{ $props.title }}
        </q-toolbar-title>
        <q-btn
          flat
          v-close-overlay
          label="Close"
        />
      </q-toolbar>

      <slot />

    </q-modal-layout>
  </q-modal>
</template>

<style scoped>
</style>
