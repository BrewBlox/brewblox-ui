<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { featureStore } from '@/store/features';
import { Service, serviceStore } from '@/store/services';


@Component
export default class ServicePage extends Vue {
  get serviceId(): string {
    return this.$route.params.id;
  }

  get service(): Service | null {
    return serviceStore.serviceById(this.serviceId);
  }

  get pageComponent(): string | null {
    return this.service !== null
      ? featureStore.serviceById(this.service.type)?.page ?? null
      : null;
  }
}
</script>

<template>
  <component
    :is="pageComponent"
    v-if="pageComponent !== null"
    :service-id="serviceId"
  />
  <q-page v-else class="text-h5 darkened">
    <div v-if="service !== null" class="absolute-center">
      Invalid service page for '{{ serviceId }}'
    </div>
    <div v-else class="absolute-center">
      Service '{{ serviceId }}' not found.
    </div>
  </q-page>
</template>
