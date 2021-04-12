<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';

import { featureStore } from '@/store/features';
import { Service, serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';

export default defineComponent({
  name: 'ServicePage',
  setup() {
    const route = useRoute();

    const serviceId = computed<string>(
      () => route.params.id as string,
    );

    const loaded = computed<boolean>(
      () => systemStore.loaded,
    );

    const service = computed<Service | null>(
      () => serviceStore.serviceById(serviceId.value),
    );

    const pageComponent = computed<string | null>(
      () => service.value !== null
        ? featureStore.serviceById(service.value.type)?.pageComponent ?? null
        : null,
    );

    return {
      serviceId,
      loaded,
      service,
      pageComponent,
    };
  },
});
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
