<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';

import { serviceAvailable } from '@/helpers/dynamic-store';
import { pageByType, allServiceTypes } from '@/services/service-by-type';
import { serviceById, serviceExists } from '@/store/services/getters';
import InvalidPage from './InvalidPage.vue';

const allPages = allServiceTypes()
  .filter(pageByType)
  .reduce((acc: any, type: string) => ({ ...acc, type: pageByType(type) }), {});

@Component({
  components: {
    ...allPages,
  },
})
export default class ServicePage extends Vue {
  get serviceId(): string {
    return this.$route.params.id;
  }

  get serviceValid() {
    return serviceExists(this.$store, this.serviceId)
      && serviceAvailable(this.$store, this.serviceId);
  }

  pageComponent(): VueConstructor {
    try {
      const service = serviceById(this.$store, this.serviceId);
      return pageByType(service.type) || InvalidPage;
    } catch (e) {
      return InvalidPage;
    }
  }
}
</script>

<template>
  <q-page padding>
    <component
      v-if="serviceValid"
      :is="pageComponent()"
      :serviceId="serviceId"
    />
    <p v-else>
      Service {{ serviceId }} not found.
    </p>
  </q-page>
</template>

<style scoped>
</style>
