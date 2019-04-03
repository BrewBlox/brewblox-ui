<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import { serviceIds } from '@/store/services/getters';
import { Block } from '@/plugins/spark/state';
import { blockValues, blocks } from '@/plugins/spark/store/getters';
import { objectStringSorter } from '@/helpers/functional';
import { Link } from '@/helpers/units';

@Component
export default class ActuatorPartCard extends PartCard {
  serviceId: string | null = null;
  block: Block | null = null;

  get supportedTypes() {
    return [
      'ActuatorPin',
      'ActuatorDS2413',
    ];
  }

  get serviceOptions() {
    return serviceIds(this.$store);
  }

  get blockOptions() {
    if (!this.serviceId) {
      return [];
    }

    return blockValues(this.$store, this.serviceId)
      .filter(block => this.supportedTypes.includes(block.type))
      .sort(objectStringSorter('id'));
  }

  saveBlock() {
    const updatedSettings = this.block
      ? {
        actuatorServiceId: this.serviceId,
        actuatorLink: new Link(this.block.id, this.block.type),
      }
      : {
        actuatorLink: null,
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
    if (this.part.settings.actuatorLink) {
      this.serviceId = this.part.settings.actuatorServiceId;
      this.block = blocks(this.$store, this.serviceId as string)[this.part.settings.actuatorLink.id];
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
          label="Sensor"
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
            <q-btn flat round icon="mdi-close-circle" @click="block = null"/>
          </template>
        </q-select>
      </q-item-section>
    </q-item>
    <q-item dark>
      <q-item-section>
        <q-btn label="Save" unelevated color="primary" @click="saveBlock"/>
      </q-item-section>
    </q-item>
  </q-list>
</template>
