<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import providerStore from '@/store/providers';
import serviceStore from '@/store/services';
import sparkStore from '@/plugins/spark/store';
import { Service } from '@/store/services/types';
import { typeName } from '@/plugins/spark/getters';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
    serviceTitle: {
      type: String,
      required: true,
    },
  },
})
export default class SparkWizard extends Vue {
  async create() {
    const service: Service = {
      id: this.$props.serviceId,
      title: this.$props.serviceTitle,
      order: serviceStore.serviceIds.length + 1,
      config: {},
      type: typeName,
    };
    await serviceStore.createService(service);
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Added ${providerStore.displayNameById(service.type)} ${service.title}`,
    });
    this.$emit('close');
  }

  async cancel() {
    this.$q.notify({
      color: 'negative',
      icon: 'error',
      message: `Service with ID '${this.$props.serviceId}' invalid or not found`,
    });
    this.$emit('back');
  }

  async mounted() {
    const ok = await sparkStore.validateService(this.$props.serviceId);
    if (ok) {
      this.create();
    } else {
      this.cancel();
    }
  }
}
</script>

<template>
  <q-card-section style="min-height: 100px">
    <q-item>
      <q-spinner :size="30" style="margin: auto"/>
    </q-item>
  </q-card-section>
</template>

