<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';

import { pageByType, allServiceTypes } from '@/services/service-by-type';
import { serviceById } from '@/store/services/getters';
import InvalidPage from './InvalidPage.vue';

const allPages = allServiceTypes()
  .filter(pageByType)
  .reduce((acc: any, type: string) => ({ ...acc, type: pageByType(type) }), {});

/* eslint-disable indent */
@Component({
  components: {
    ...allPages,
  },
})
/* eslint-enable */
export default class ServicePage extends Vue {
  get serviceId(): string {
    return this.$route.params.id;
  }

  get pageComponent(): VueConstructor {
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
      :is="pageComponent"
      :serviceId="serviceId"
    />
  </q-page>
</template>

<style scoped>
</style>
