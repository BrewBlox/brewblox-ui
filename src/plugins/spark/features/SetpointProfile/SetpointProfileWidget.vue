<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { SetpointProfileBlock } from './state';
import { getById } from './getters';

@Component
export default class SetpointProfileWidget extends BlockWidget {
  get block(): SetpointProfileBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  set block(block: SetpointProfileBlock) {
    this.saveBlock(block);
  }

  asDate(timeS: number) {
    return new Date(timeS * 1000).toLocaleString();
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <SetpointProfileForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn flat round dense slot="right" @click="() => this.modalOpen = true" icon="settings" />
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-carousel quick-nav class="col" v-model="slideIndex">
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">

            </q-card-main>
          </div>
        </q-carousel-slide>

      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
</style>
