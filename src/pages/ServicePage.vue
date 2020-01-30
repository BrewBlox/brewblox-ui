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

  get serviceExists(): boolean {
    return serviceStore.serviceExists(this.serviceId);
  }

  get pageComponent(): string | null {
    const service = serviceStore.serviceById(this.serviceId);
    return service
      ? featureStore.services[service.type]?.page ?? null
      : null;
  }
}
</script>

<template>
  <component
    :is="pageComponent"
    v-if="serviceExists && pageComponent"
    :service-id="serviceId"
  />
  <q-page v-else class="text-h5 darkened">
    <div v-if="serviceExists" class="absolute-center">
      Invalid service page for '{{ serviceId }}'
    </div>
    <div v-else class="absolute-center">
      Service '{{ serviceId }}' not found.
    </div>
  </q-page>
</template>
