<script setup lang="ts">
import { useFeatureStore } from '@/store/features';
import { Service, useServiceStore } from '@/store/services';
import { computed } from 'vue';

const props = defineProps({
  routeId: {
    type: String,
    default: '',
  },
});

const featureStore = useFeatureStore();
const serviceStore = useServiceStore();
const serviceId = computed<string>(() => props.routeId);

const service = computed<Service | null>(() =>
  serviceStore.serviceById(serviceId.value),
);

const pageComponent = computed<string | null>(() =>
  service.value !== null
    ? featureStore.serviceById(service.value.type)?.pageComponent ?? null
    : null,
);
</script>

<template>
  <component
    :is="pageComponent"
    v-if="pageComponent !== null"
    :service-id="serviceId"
  />
  <q-page
    v-else
    class="page-height text-h5 darkened"
  >
    <PageError>
      <span v-if="service !== null">
        Invalid service page for <b>{{ serviceId }} </b>.
      </span>
      <span v-else>
        Service <b>{{ serviceId }}</b> not found.
      </span>
    </PageError>
  </q-page>
</template>
