<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class TempSensorMockForm extends BlockForm {
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Value">
          <big>{{ block.data.value | unit }}</big>
        </q-field>
        <q-field class="col" label="Connected">
          <q-toggle :value="block.data.connected" @input="v => { block.data.connected = v; saveBlock(); }" />
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

