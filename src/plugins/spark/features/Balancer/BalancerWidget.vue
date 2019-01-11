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
    <q-card-main class="column widget-body">
      <div class="full-width">
        <q-item class="full-width text-center">Clients</q-item>
        <q-field
          v-for="client in block.data.clients"
          :key="client.id.id"
          :label="client.id.id || 'unknown'"
          class="col"
        >
          <big>{{ client.granted | round }} / {{ client.requested | round }}</big>
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>
