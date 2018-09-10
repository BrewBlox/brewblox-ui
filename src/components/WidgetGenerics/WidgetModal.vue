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
      default: () => { throw new Error('Provide onClose callback'); },
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

  // @Watch('isOpen', { immediate: true, deep: true })
  // onOpenedChange() {
  //   this.childOpen = this.$props.isOpen;
  // }
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

<style>
.layout-padding {
  position: relative;
}

.slide-enter-active,
.slide-leave-active {
  position: absolute;
  width: calc(100% - 96px);
  transition: opacity 0.2s, margin-top 0.2s;
}

.slide-enter,
.slide-leave-to {
  opacity: 0;
  margin-top: -40px;
}

.modal .q-list {
  border: 0;
}
</style>
