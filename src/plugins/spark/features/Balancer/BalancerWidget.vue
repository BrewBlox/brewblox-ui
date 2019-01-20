<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { BalancerBlock } from './state';

@Component
export default class BalancerWidget extends BlockWidget {
  get block(): BalancerBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return this.block.data.clients
      .reduce(
        (acc, client, idx) => ({
          ...acc,
          [`clients/${idx}/requested`]: `${client.id.id} requested`,
          [`clients/${idx}/granted`]: `${client.id.id} granted`,
        }),
        {},
    );
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <BalancerForm v-if="modalOpen" :field="block" :change="saveBlock" :change-id="changeBlockId"/>
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="widgetId"
        :change="v => widgetId = v"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-card-main class="widget-body column">
      <div class="full-width">
        <div class="row">
          <div class ="q-field-label col">Clients</div>
          <div class ="q-field-label col">Granted</div>
          <div class ="q-field-label col">Requested</div>
        </div>
        <div v-for="client in block.data.clients"
             :key="client.id.id"
             class="row"
        >
          <div class ="q-label col self-center">{{ client.id.id || 'unknown' }}</div>
          <big class="col">{{ client.granted | round }}</big>
          <big class="col">{{ client.requested | round }}</big>
        </div>
      </div>
    </q-card-main>
  </q-card>
</template>
