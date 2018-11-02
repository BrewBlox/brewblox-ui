<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { setTimeout } from 'timers';

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
    onSave: {
      type: Function,
      required: false,
    },
  },
})
export default class WidgetModal extends Vue {
  modalLoaded: boolean = false;

  get modalOpen() {
    this.modalLoaded = this.modalLoaded || this.$props.isOpen;
    return this.$props.isOpen;
  }

  set modalOpen(val: boolean) {
    if (!val) {
      this.$props.onClose();
    }
  }

  saveClose() {
    // todo: check that there are no dirty input fields
    setTimeout(
      () => {
        this.$props.onSave();
        this.$props.onClose();
      },
      500,
    );
  }
}
</script>

<template>
  <q-modal
    v-model="modalOpen"
    :content-css="{ minWidth: '80vw', maxHeight: '80vh' }"
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
          label="Save & Close"
          v-if="$props.onSave"
          @click="saveClose"
        />
        <q-btn
          flat
          label="Close"
          @click="$props.onClose"
        />
      </q-toolbar>

      <slot v-if="modalLoaded" />

    </q-modal-layout>
  </q-modal>
</template>

<style scoped>
</style>
