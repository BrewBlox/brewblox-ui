<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import featureStore from '@/store/features';
import { blocks } from '../store/getters';
import { saveBlock } from '../store/actions';
import { Block } from '../state';
import isString from 'lodash/isString';

@Component({
  props: {
    blockId: {
      type: String,
      validator: v => v === null || isString(v),
    },
    serviceId: {
      type: String,
      required: true,
    },
    btnProps: {
      type: Object,
      default: () => ({}),
    },
    tag: {
      type: String,
      default: 'div',
    },
    tagProps: {
      type: Object,
      default: () => ({}),
    },
  },
})
export default class BlockFormButton extends Vue {
  $q: any; // injected by quasar
  modalOpen: boolean = false;

  get block(): Block | null {
    const id = this.$props.blockId;

    return !!id
      ? blocks(this.$store, this.$props.serviceId)[id] || null
      : null;
  }

  get blockForm() {
    return !!this.block
      ? featureStore.formById(this.block.type)
      : null;
  }

  saveBlock(v) {
    saveBlock(this.$store, this.$props.serviceId, v)
      .catch(err => this.$q.notify(err.toString()));
  }
}
</script>

<template>
  <component :is="tag" v-bind="tagProps">
    <q-btn :disable="!block" v-bind="btnProps" @click="modalOpen = true">
      <slot/>
    </q-btn>
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <component
        v-if="modalOpen"
        :is="blockForm"
        :type="block.type"
        :field="block"
        :on-change-field="v => saveBlock(v)"
        :id="block.id"
        :title="block.id"
        :on-change-block-id="() => {}"
      />
    </q-dialog>
  </component>
</template>
