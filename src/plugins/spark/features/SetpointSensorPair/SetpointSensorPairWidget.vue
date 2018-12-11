<script lang="ts">
import { serializedPropertyName } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointSensorPairBlock } from './state';

@Component
export default class SetpointSensorPairWidget extends BlockWidget {
  get block(): SetpointSensorPairBlock {
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
      [serializedPropertyName('setpointValue', this.block.data)]: 'Setpoint',
      [serializedPropertyName('sensorValue', this.block.data)]: 'Sensor',
    };
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <SetpointSensorPairForm
        v-if="modalOpen"
        :field="block"
        :change="saveBlock"
        :changeId="changeBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        class="ellipsis"
        :field="widgetId"
        label="Widget ID"
        display="span"
        :change="v => widgetId = v"
      />
      <span class="vertical-middle on-left" slot="right">{{ displayName }}</span>
      <q-btn flat round dense slot="right" @click="openModal" icon="settings"/>
      <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh"/>
    </q-card-title>
    <q-card-separator/>
    <q-carousel quick-nav class="col" v-model="slideIndex">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Setpoint value">
              <big>{{ block.data.setpointValue | unit }}</big>
            </q-field>
            <q-field class="col" label="Sensor value">
              <big>{{ block.data.sensorValue | unit }}</big>
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <!-- Settings -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Setpoint">
              <LinkPopupEdit
                label="Setpoint"
                :field="block.data.setpointId"
                :serviceId="serviceId"
                :change="callAndSaveBlock(v => block.data.setpointId = v)"
              />
            </q-field>
            <q-field class="col" label="Sensor">
              <LinkPopupEdit
                label="Sensor"
                :field="block.data.sensorId"
                :serviceId="serviceId"
                :change="callAndSaveBlock(v => block.data.sensorId = v)"
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
        slot="quick-nav"
        slot-scope="props"
        color="white"
        flat
        dense
        :icon="navIcon(props.slide)"
        :label="navTitle(props.slide)"
        @click="props.goToSlide()"
        :class="{inactive: !props.current}"
      />
    </q-carousel>
  </q-card>
</template>

<style scoped>
</style>

