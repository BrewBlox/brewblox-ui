<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class BalancerForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          clients: [],
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Clients</q-card-title>
      <q-card-main>
        <q-field
          v-for="client in block.data.clients"
          :key="client.id.id"
          class="col"
          :label="client.id.id || 'unknown'"
        >
          <big>{{ client.granted | round}} / {{ client.requested | round }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Block ID">
          <InputPopupEdit label="Block ID" :field="block.id" :change="changeBlockId"/>
        </q-field>
        <q-field class="col" label="Service ID">
          <big>{{ serviceId }}</big>
        </q-field>
        <q-field class="col" label="Block Type">
          <big>{{ block.type }}</big>
        </q-field>
        <q-field class="col" label="Profiles">
          <ProfilesPopupEdit
            :field="block.profiles"
            :serviceId="serviceId"
            :change="callAndSaveBlock(v => block.profiles = v)"
          />
        </q-field>
        <q-field class="col" label="Preset">
          <SelectPopupEdit
            label="Preset"
            :field="block.data"
            :options="presets()"
            :change="callAndSaveBlock(v => block.data = v)"
          />
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

