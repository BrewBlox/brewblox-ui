<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { featureStore } from '@/store/features';
import { serviceStore } from '@/store/services';


@Component
export default class ServicePage extends Vue {
  get serviceId(): string {
    return this.$route.params.id;
  }

  get serviceValid(): boolean {
    return serviceStore.serviceExists(this.serviceId);
  }

  get pageComponent(): string | null {
    const service = serviceStore.serviceById(this.serviceId);
    return featureStore.services[service.type]?.page ?? null;
  }
}
</script>

<template>
  <component
    :is="pageComponent"
    v-if="serviceValid && pageComponent"
    :service-id="serviceId"
  />
  <q-page v-else padding>
    <div v-if="serviceValid" class="flex flex-center">
      Invalid service page: {{ serviceId }}
    </div>
    <p v-else>
      Service {{ serviceId }} not found.
    </p>
  </q-page>
</template>
