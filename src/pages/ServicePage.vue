<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';

import { serviceAvailable } from '@/helpers/dynamic-store';
import { pageById } from '@/store/providers/getters';
import { serviceById, serviceExists } from '@/store/services/getters';
import InvalidPage from './InvalidPage.vue';

@Component({
  components: {
    InvalidPage,
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

  pageComponent(): string | VueConstructor {
    try {
      const service = serviceById(this.$store, this.serviceId);
      return pageById(this.$store, service.type) || InvalidPage;
    } catch (e) {
      return InvalidPage;
    }
  }
}
</script>

<template>
  <q-page padding>
    <component v-if="serviceValid" :is="pageComponent()" :service-id="serviceId"/>
    <p v-else>Service {{ serviceId }} not found.</p>
  </q-page>
</template>

<style scoped>
</style>
