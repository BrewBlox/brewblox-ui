<script lang="ts">
import { serializedPropertyName } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { TempSensorOneWireBlock } from './state';

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
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <TempSensorOneWireForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
        :change-id="changeBlockId"
      />
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
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert v-if="block.data.value === null" type="warning" color="warn">This sensor is invalid</q-alert>
    <q-carousel v-model="slideIndex" quick-nav class="col">
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
              <InputPopupEdit
                :field="block.data.address"
                :change="callAndSaveBlock(v => block.data.address = v)"
                label="Address"
              />
            </q-field>
            <q-field class="col" label="Offset">
              <UnitPopupEdit
                :field="block.data.offset"
                :change="callAndSaveBlock(v => block.data.offset = v)"
                label="Offset"
              />
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <!-- Graph -->
      <q-carousel-slide class="unpadded">
        <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
      </q-carousel-slide>
      <q-btn
        slot-scope="props"
        slot="quick-nav"
        :icon="navIcon(props.slide)"
        :label="navTitle(props.slide)"
        :class="{inactive: !props.current}"
        color="white"
        flat
        dense
        @click="props.goToSlide()"
      />
    </q-carousel>
  </q-card>
</template>

<style scoped>
</style>
