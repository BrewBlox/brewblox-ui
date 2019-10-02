<script lang="ts">
import get from 'lodash/get';
import { Component, Prop } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { sparkStore } from '@/plugins/spark/store';
import { Service, serviceStore } from '@/store/services';

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

  get sparkServices(): Service[] {
    return serviceStore.serviceValues
      .filter(svc => svc.type === 'Spark');
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
        .map(block => new Link(block.id, block.type))
        .filter(this.actualFilter)
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

  get compatibleTypes(): string[] {
    if (!this.sparkServices.length) {
      return [];
    }
    const compatibleTable = sparkStore.compatibleTypes(this.sparkServices[0].id);
    return this.types
      .reduce((acc, type) => [...acc, ...get(compatibleTable, type, [])], [...this.types]);
  }

  get actualFilter(): (link: Link) => boolean {
    if (this.filter) {
      return this.filter;
    }
    return block => !this.compatibleTypes || this.compatibleTypes.includes(block.type || '');
  }

  createBlock(serviceId: string): void {
    createDialog({
      component: 'BlockWizardDialog',
      root: this.$root,
      serviceId,
      filter: feat => !this.compatibleTypes || this.compatibleTypes.includes(feat),
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
        root: this.$root,
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
  <q-list dark>
    <q-separator dark />
    <q-item dark>
      <q-item-section>
        <q-select
          v-model="linked"
          :options="linkedOpts"
          :label="label"
          :error="broken"
          clearable
          dark
          options-dark
          map-options
          emit-value
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:error>
            <div>Link broken: {{ linked.blockId }} not found</div>
          </template>
          <template v-if="!noCreate" v-slot:after>
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
