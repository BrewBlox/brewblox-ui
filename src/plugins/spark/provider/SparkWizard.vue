<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { typeName } from '@/plugins/spark/getters';
import { sparkStore } from '@/plugins/spark/store';
import { providerStore } from '@/store/providers';
import { serviceStore } from '@/store/services';

import { Spark } from '../types';

@Component
export default class SparkWizard extends Vue {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: String, required: true })
  readonly serviceTitle!: string;

  async created(): Promise<void> {
    const service: Spark = {
      id: this.serviceId,
      title: this.serviceTitle,
      order: serviceStore.serviceIds.length + 1,
      config: {
        groupNames: [],
        expandedBlocks: {},
        sorting: 'unsorted',
      },
      type: typeName,
    };
    await serviceStore.createService(service);
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Added ${providerStore.displayNameById(service.type)} ${service.title}`,
    });
    this.$emit('close');
  }

  async cancel(): Promise<void> {
    this.$q.notify({
      color: 'negative',
      icon: 'error',
      message: `Service with ID '${this.serviceId}' invalid or not found`,
    });
    this.$emit('back');
  }

  async mounted(): Promise<void> {
    const ok = await sparkStore.validateService(this.serviceId);
    if (ok) {
      this.created();
    } else {
      this.cancel();
    }
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

