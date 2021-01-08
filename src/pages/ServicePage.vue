<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { featureStore } from '@/store/features';
import { Service, serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';


@Component
export default class ServicePage extends Vue {
  get serviceId(): string {
    return this.$route.params.id;
  }

  get loaded(): boolean {
    return systemStore.loaded;
  }

  get service(): Service | null {
    return serviceStore.serviceById(this.serviceId);
  }

  get pageComponent(): string | null {
    return this.service !== null
      ? featureStore.serviceById(this.service.type)?.pageComponent ?? null
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
  <q-page v-else class="page-height text-h5 darkened">
    <PageError>
      <span v-if="service !== null">
        Invalid service page for <b>{{ serviceId }}</b>.
      </span>
      <span v-else>
        Service <b>{{ serviceId }}</b> not found.
      </span>
    </PageError>
  </q-page>
</template>
