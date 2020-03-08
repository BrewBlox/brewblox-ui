<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { sparkType } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import { Service, serviceStore } from '@/store/services';

import { isCompatible } from '../../spark/block-types';
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

  @Prop({ type: Boolean, default: false })
  public readonly noCreate!: boolean;

  get sparkServices(): Service[] {
    return serviceStore.serviceValues
      .filter(svc => svc.type === sparkType);
  }

  get linked(): LinkedBlock {
    return settingsLink(this.part, this.settingsKey);
  }

  set linked(val: LinkedBlock) {
    this.savePartSettings({
      ...this.part.settings,
      [this.settingsKey]: { ...val },
    });
  }

  get broken(): boolean {
    return !!this.linked.serviceId
      && !!this.linked.blockId
      && !sparkStore.tryBlockById(this.linked.serviceId, this.linked.blockId);
  }

  get linkedOpts(): { label: string; value: LinkedBlock }[] {
    const sorter = objectStringSorter('id');
    return this.sparkServices
      .flatMap(svc => sparkStore.blockValues(svc.id)
        .filter(block => this.typeFilter(block.type))
        .map(block => new Link(block.id, block.type))
        .sort(sorter)
        .map(link => ({
          label: `[${svc.id}] ${link.id}`,
          value: {
            serviceId: svc.id,
            blockId: link.id,
          },
        }))
      );
  }

  get serviceId(): string | null {
    return this.linked.serviceId;
  }

  get typeFilter(): (type: string | null) => boolean {
    return type => isCompatible(type, this.types);
  }

  createBlock(serviceId: string): void {
    createDialog({
      component: 'BlockWizardDialog',
      parent: this,
      serviceId,
      filter: this.typeFilter,
    })
      .onOk(block => {
        this.linked = { serviceId, blockId: block.id };
      });
  }

  startCreate(): void {
    if (this.sparkServices.length == 1) {
      this.createBlock(this.sparkServices[0].id);
    } else {
      createDialog({
        component: 'SelectDialog',
        parent: this,
        title: 'Pick a Service',
        value: this.sparkServices[0].id,
        selectOptions: this.sparkServices.map(svc => svc.id),
        selectProps: {
          label: 'Spark Service',
        },
      })
        .onOk(id => id && this.createBlock(id));
    }
  }
}
</script>

<template>
  <q-list>
    <q-separator />
    <q-item>
      <q-item-section>
        <q-select
          v-model="linked"
          :options="linkedOpts"
          :label="label"
          :error="broken"
          clearable
          map-options
          emit-value
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
          <template #error>
            <div>Link broken: {{ linked.blockId }} not found</div>
          </template>
          <template v-if="!noCreate" #after>
            <BlockDialogButton
              :block-id="linked.blockId"
              :service-id="serviceId || ''"
              flat
              round
            >
              <q-tooltip>Edit Block</q-tooltip>
            </BlockDialogButton>
            <q-btn :disable="!sparkServices.length" flat round icon="add" @click="startCreate">
              <q-tooltip>Create new Block</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
  </q-list>
</template>
