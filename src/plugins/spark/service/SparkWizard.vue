<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import notify from '@/helpers/notify';
import { sparkType } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';

import { SparkService } from '../types';

@Component
export default class SparkWizard extends Vue {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, required: true })
  readonly serviceTitle!: string;

  created(): void {
    sparkStore.validateService(this.serviceId)
      .then(ok => ok
        ? this.createService()
        : this.cancel());
  }

  async createService(): Promise<void> {
    const service: SparkService = {
      id: this.serviceId,
      title: this.serviceTitle,
      type: sparkType,
      order: serviceStore.serviceIds.length + 1,
      config: {
        groupNames: [],
        expandedBlocks: {},
        sorting: 'unsorted',
        pageMode: 'List',
      },
    };
    try {
      await serviceStore.createService(service);
      notify.done(`Added ${featureStore.services[service.type]?.title} '${service.title}'`);
      this.$emit('close');
    } catch (e) {
      notify.error(`Failed to create service ${this.serviceId}: ${e}`);
      this.$emit('back');
    }
  }

  async cancel(): Promise<void> {
    notify.error(`Service with ID '${this.serviceId}' invalid or not found`);
    this.$emit('back');
  }
}
</script>

<template>
  <q-card-section style="min-height: 100px">
    <q-item>
      <q-spinner :size="30" style="margin: auto" />
    </q-item>
  </q-card-section>
</template>

