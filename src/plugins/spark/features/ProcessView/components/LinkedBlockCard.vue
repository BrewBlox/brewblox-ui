<script lang="ts">
import get from 'lodash/get';
import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import sparkStore from '@/plugins/spark/store';
import serviceStore from '@/store/services';

import { settingsLink } from '../helpers';
import { LinkedBlock } from '../types';
import PartCard from './PartCard';

@Component
export default class LinkedBlockCard extends PartCard {

  @Prop({ type: String, required: true })
  public readonly settingsKey!: string;

  @Prop({ type: Array, required: true })
  public readonly types!: string[];

  @Prop({ type: String, default: 'Block' })
  public readonly label!: string;

  @Prop({ type: Function })
  readonly filter!: (link: Link) => boolean;

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  get linked(): LinkedBlock {
    return settingsLink(this.part, this.settingsKey);
  }

  set linked(val: LinkedBlock) {
    this.savePartSettings({
      ...this.part.settings,
      [this.settingsKey]: { ...val },
    });
  }

  get serviceId(): string | null {
    return this.linked.serviceId;
  }

  set serviceId(serviceId: string | null) {
    const blockId = serviceId === this.serviceId
      ? this.linked.blockId
      : null;
    this.linked = { serviceId, blockId };
  }

  get link(): Link {
    return new Link(this.linked.blockId);
  }

  set link(newVal: Link) {
    const blockId = !!newVal
      ? newVal.id
      : null;
    this.linked = { serviceId: this.serviceId, blockId };
  }

  get serviceOptions() {
    return serviceStore.serviceIds;
  }

  get compatibleTypes() {
    if (!this.serviceId) {
      return [];
    }
    const compatibleTable = sparkStore.compatibleTypes(this.serviceId);
    return this.types
      .reduce((acc, type) => [...acc, ...get(compatibleTable, type, [])], [...this.types]);
  }

  get actualFilter() {
    if (this.filter) {
      return this.filter;
    }
    return block => !this.compatibleTypes || this.compatibleTypes.includes(block.type);
  }

  get linkOpts(): Link[] {
    if (!this.serviceId) {
      return [];
    }
    return sparkStore.blockValues(this.serviceId)
      .map(block => new Link(block.id, block.type))
      .filter(this.actualFilter)
      .sort(objectStringSorter('id'));
  }

  create() {
    Dialog.create({
      component: 'BlockWizardDialog',
      root: this.$root,
      serviceId: this.serviceId,
      filter: feat => !this.compatibleTypes || this.compatibleTypes.includes(feat),
    })
      .onOk(block => {
        this.link = new Link(block.id);
      });
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-select
          v-model="serviceId"
          :options="serviceOptions"
          :label="`${label} Service`"
          dark
          options-dark
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>
        <q-select
          v-model="link"
          :options="linkOpts"
          :label="label"
          clearable
          dark
          options-dark
          option-label="id"
          option-value="id"
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section v-if="serviceId" class="text-grey">No results</q-item-section>
              <q-item-section v-else class="text-grey">Please select a service</q-item-section>
            </q-item>
          </template>
          <template v-slot:after v-if="!noCreate">
            <BlockFormButton
              :disable="!link.id"
              :block-id="link.id"
              :service-id="serviceId || ''"
              flat
              round
            >
              <q-tooltip>Edit Block</q-tooltip>
            </BlockFormButton>
            <q-btn :disable="!serviceId" flat round icon="add" @click="create">
              <q-tooltip>Create new Block</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
  </q-list>
</template>
