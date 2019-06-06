<script lang="ts">
import isString from 'lodash/isString';
import { uid } from 'quasar';
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

  @Prop({ type: Object, default: () => ({}) })
  readonly btnProps!: any;

  @Prop({ type: String, default: 'div' })
  readonly tag!: string;

  @Prop({ type: Object, default: () => ({}) })
  readonly tagProps!: any;

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

  saveBlock(v) {
    sparkStore.saveBlock([this.serviceId, v])
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
        :widget="widget"
        :block="block"
        volatile
        @update:widget="saveBlock"
      />
    </q-dialog>
  </component>
</template>
