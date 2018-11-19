<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorPwmBlock } from './state';
import { getById } from './getters';

@Component
export default class ActuatorPwmWidget extends BlockWidget {
  get block(): ActuatorPwmBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
      'Constraints',
      'Graph',
    ];
  }

  get renamedTargets() {
    return {
      setting: 'Setting',
      period: 'Period',
      value: 'Value',
    };
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <ActuatorPwmForm v-if="modalOpen" :field="block" :change="saveBlock" />
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
              <q-field class="col" label="Actuator">
                <LinkPopupEdit label="Actuator" :field="block.data.actuatorId" :serviceId="serviceId" :change="callAndSaveBlock(v => block.data.actuatorId = v)" />
              </q-field>
              <q-field class="col" label="Period">
                <InputPopupEdit label="Period" type="number" :field="block.data.period" :change="callAndSaveBlock(v => block.data.period = v)" />
              </q-field>
              <q-field class="col" label="Setting">
                <InputPopupEdit label="Setting" type="number" :field="block.data.setting" :change="callAndSaveBlock(v => block.data.setting = v)" />
              </q-field>
              <q-field class="col" label="Value">
                <big>{{ block.data.value | round }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>

        <!-- Constraints -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field class="col" label="Constraints" orientation="vertical">
                <ReadonlyConstraints :serviceId="serviceId" v-model="block.data.constrainedBy" />
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

