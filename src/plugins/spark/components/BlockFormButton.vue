<script lang="ts">
import isString from 'lodash/isString';
import { Dialog, uid } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store';
import { DashboardItem } from '@/store/dashboards';
import featureStore from '@/store/features';

import { Block } from '../types';

@Component
export default class BlockFormButton extends Vue {
  modalOpen: boolean = false;

  @Prop({ type: String, validator: v => v === null || isString(v) })
  readonly blockId!: string;

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get block(): Block | null {
    return !!this.blockId
      ? sparkStore.blocks(this.serviceId)[this.blockId] || null
      : null;
  }

  get blockForm() {
    return !!this.block
      ? featureStore.formById(this.block.type)
      : null;
  }

  get widget(): DashboardItem | null {
    return !!this.block
      ? {
        id: uid(),
        title: this.block.id,
        feature: this.block.type,
        dashboard: '',
        order: 0,
        config: {
          serviceId: this.serviceId,
          blockId: this.block.id,
        },
        ...featureStore.widgetSizeById(this.block.type),
      }
      : null;
  }

  openDialog() {
    Dialog.create({
      component: 'BlockFormDialog',
      block: this.block,
      widget: this.widget,
      volatile: true,
      saveBlock: v => sparkStore.saveBlock([this.serviceId, v]),
      saveWidget: () => { },
      root: this.$root,
    });
  }
}
</script>

<template>
  <q-btn :disable="!block" v-bind="$attrs" @click="openDialog">
    <slot/>
  </q-btn>
</template>
