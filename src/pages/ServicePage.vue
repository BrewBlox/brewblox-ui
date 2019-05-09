<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import Component from 'vue-class-component';
import providerStore from '@/store/providers';
import serviceStore from '@/store/services';
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
    return serviceStore.serviceExists(this.serviceId);
  }

  pageComponent(): string | VueConstructor {
    try {
      const service = serviceStore.serviceById(this.serviceId);
      return providerStore.pageById(service.type) || InvalidPage;
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

