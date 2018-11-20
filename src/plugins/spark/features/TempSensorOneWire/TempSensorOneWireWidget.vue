<script lang="ts">
import Component from 'vue-class-component';
import { serializedPropertyName } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { TempSensorOneWireBlock } from './state';
import { getById } from './getters';

@Component
export default class TempSensorOneWireWidget extends BlockWidget {
  get block(): TempSensorOneWireBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
      'Settings',
      'Graph',
    ];
  }

  get renamedTargets() {
    return {
      [serializedPropertyName('value', this.block.data)]: 'Value',
      [serializedPropertyName('offset', this.block.data)]: 'Offset',
    };
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <TempSensorOneWireForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings" />
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-alert type="warning" color="warn" v-if="!this.block.data.valid">
        This sensor is invalid
      </q-alert>

      <q-carousel quick-nav class="col" v-model="slideIndex">
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field class="col" label="Value">
                <big>{{ block.data.value | unit }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>

        <!-- Settings -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field class="col" label="Address">
                <InputPopupEdit label="Address" :field="block.data.address" :change="callAndSaveBlock(v => block.data.address = v)" />
              </q-field>
              <q-field class="col" label="Offset">
                <UnitPopupEdit label="Offset" :field="block.data.offset" :change="callAndSaveBlock(v => block.data.offset = v)" />
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
