<script lang="ts">
import { validateService } from '@/plugins/spark/store/actions';
import { typeName } from '@/plugins/spark/store/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Service } from '@/store/services/state';
import { serviceIds } from '@/store/services/getters';
import { createService, initService } from '@/store/services/actions';
import { displayNameById } from '@/store/providers/getters';

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
  $q: any;

  async create() {
    const service: Service = {
      id: this.$props.serviceId,
      title: this.$props.serviceTitle,
      order: serviceIds(this.$store).length + 1,
      config: {},
      type: typeName,
    };
    await createService(this.$store, service);
    await initService(this.$store, service);
    this.$q.notify({
      icon: 'mdi-check-all',
      color: 'positive',
      message: `Added ${displayNameById(this.$store, service.type)} ${service.title}`,
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
    const ok = await validateService(this.$props.serviceId);
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
      <q-spinner :size="30" class="centered"/>
    </q-item>
  </q-card-section>
</template>

