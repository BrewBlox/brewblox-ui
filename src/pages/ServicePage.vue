<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { providerStore } from '@/store/providers';
import { serviceStore } from '@/store/services';


@Component
export default class ServicePage extends Vue {
  get serviceId(): string {
    return this.$route.params.id;
  }

  get serviceValid() {
    return serviceStore.serviceExists(this.serviceId);
  }

  get pageComponent(): string | null {
    try {
      const service = serviceStore.serviceById(this.serviceId);
      return providerStore.pageById(service.type) || null;
    } catch (e) {
      return null;
    }

  }
}
</script>

<template>
  <q-page padding>
    <component v-if="serviceValid && pageComponent" :is="pageComponent" :service-id="serviceId" />
    <div v-else-if="serviceValid" class="flex flex-center">Invalid service page: {{ serviceId }}</div>
    <p v-else>Service {{ serviceId }} not found.</p>
  </q-page>
</template>
