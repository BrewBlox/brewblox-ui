<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import serviceStore from '@/store/services';
import sparkStore from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { objectStringSorter } from '@/helpers/functional';
import get from 'lodash/get';
import { Link } from '@/helpers/units';

@Component({
  props: {
    types: {
      type: Array,
      required: true,
    },
    blockServiceIdKey: {
      type: String,
      default: 'blockServiceId',
    },
    blockLinkKey: {
      type: String,
      default: 'blockLink',
    },
  },
})
export default class BlockPartCard extends PartCard {
  serviceId: string | null = null;
  block: Block | null = null;

  get serviceOptions() {
    return serviceStore.serviceIds;
  }

  get blockOptions() {
    if (!this.serviceId) {
      return [];
    }

    return sparkStore.blockValues(this.serviceId)
      .filter(block => this.$props.types.includes(block.type))
      .sort(objectStringSorter('id'));
  }

  saveBlock() {
    const updatedSettings = this.block
      ? {
        [this.$props.blockServiceIdKey]: this.serviceId,
        [this.$props.blockLinkKey]: new Link(this.block.id, this.block.type),
      }
      : {
        [this.$props.blockLinkKey]: null,
      };

    this.savePart({
      ...this.part,
      settings: {
        ...this.part.settings,
        ...updatedSettings,
      },
    });
  }

  mounted() {
    this.serviceId = get(this.part.settings, this.$props.blockServiceIdKey, null);
    const link = get(this.part.settings, this.$props.blockLinkKey, null);
    if (this.serviceId && link) {
      this.block = sparkStore.blocks(this.serviceId as string)[link.id];
    }
  }
}
</script>

<template>
  <q-list dark>
    <q-separator dark/>
    <q-item dark>
      <q-item-section>
        <q-select v-model="serviceId" :options="serviceOptions" dark options-dark label="Service">
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
          v-model="block"
          :options="blockOptions"
          dark
          options-dark
          label="Block"
          option-label="id"
          option-value="id"
        >
          <template v-slot:no-option>
            <q-item dark>
              <q-item-section v-if="serviceId" class="text-grey">No results</q-item-section>
              <q-item-section v-else class="text-grey">Please select a service</q-item-section>
            </q-item>
          </template>
          <template v-slot:append>
            <q-btn flat round icon="mdi-close-circle" @click.stop="block = null"/>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>
        <q-btn label="Save" unelevated color="primary" @click="saveBlock"/>
      </q-item-section>
    </q-item>
    <q-item v-if="block" dark>
      <BlockFormButton
        :block-id="block.id"
        :service-id="block.serviceId"
        :btn-props="{ color: 'primary', label: 'Configure block', unelevated: true }"
        tag="q-item-section"
      />
    </q-item>
  </q-list>
</template>
