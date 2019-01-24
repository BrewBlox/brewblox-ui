<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, getClients } from './getters';
import { BalancerBlock } from './state';
import { allBlocks, compatibleBlocks } from '@/plugins/spark/store/getters';
import { ActuatorAnalogLink } from '@/helpers/units/KnownLinks';
import { fetchCompatibleBlocks } from '@/plugins/spark/store/actions';

@Component
export default class BalancerWidget extends BlockWidget {
  get block(): BalancerBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get clientNames() {
    return getClients(this.$store, this.serviceId, this.blockId);
  }

  clientName(id: number) {
    return this.clientNames[id] || id || 'unknown';
  }

  get renamedTargets() {
    return this.block.data.clients
      .reduce(
        (acc, client, idx) => ({
          ...acc,
          [`clients/${idx}/requested`]: `${this.clientName(client.id)} requested`,
          [`clients/${idx}/granted`]: `${this.clientName(client.id)} granted`,
        }),
        {},
    );
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <BalancerForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="widget-body column">
      <div class="full-width">
        <div class="row">
          <div class="q-field-label col">Clients</div>
          <div class="q-field-label col">Granted</div>
          <div class="q-field-label col">Requested</div>
        </div>
        <div v-for="client in block.data.clients" :key="client.id.id" class="row">
          <div class="q-label col self-center">{{ clientName(client.id) }}</div>
          <big class="col">{{ client.granted | round }}</big>
          <big class="col">{{ client.requested | round }}</big>
        </div>
      </div>
    </q-card-main>
  </q-card>
</template>
