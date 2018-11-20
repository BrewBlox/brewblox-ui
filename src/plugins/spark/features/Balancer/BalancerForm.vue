<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class BalancerForm extends BlockForm {
  defaultData() {
    return {
      clients: [],
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Clients</q-card-title>
      <q-card-main>
        <q-field v-for="client in block.data.clients" :key="client.id.id" class="col" :label="client.id.id || 'unknown'">
          <big>{{ client.granted | round}} / {{ client.requested | round }}</big>
        </q-field>
      </q-card-main>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>

