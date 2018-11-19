<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { BalancerBlock } from './state';
import { getById } from './getters';

@Component
export default class BalancerWidget extends BlockWidget {
  get block(): BalancerBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'Clients',
      'Graph',
    ];
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
  <div>
    <q-modal v-model="modalOpen">
      <BalancerForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings" />
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-carousel quick-nav class="col" v-model="slideIndex">
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-item class="full-width text-center">Clients</q-item>
              <q-field v-for="client in block.data.clients" :key="client.id.id" class="col" :label="client.id.id || 'unknown'">
                <big>{{ client.granted | round}} / {{ client.requested | round }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>

        <!-- Graph -->
        <q-carousel-slide class="unpadded">
          <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v" />
        </q-carousel-slide>

        <q-btn slot="quick-nav" slot-scope="props" color="white" flat dense :icon="navIcon(props.slide)" :label="navTitle(props.slide)" @click="props.goToSlide()" :class="{inactive: !props.current}" />

      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
</style>

