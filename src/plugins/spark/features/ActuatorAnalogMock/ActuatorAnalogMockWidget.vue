<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { ActuatorAnalogMockBlock } from './state';
import { getById } from './getters';
import { GraphConfig } from '@/components/Graph/state';
import { QueryParams } from '@/store/history/state';

@Component
export default class ActuatorAnalogMockWidget extends BlockWidget {
  get block(): ActuatorAnalogMockBlock {
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
      setting: 'Setting',
      value: 'Value',
    };
  }
}
</script>

<template>
  <div>
    <q-modal v-model="modalOpen">
      <ActuatorAnalogMockForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings" />
        <q-btn flat round dense slot="right" @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-alert type="warning" color="warning" v-if="!this.block.valid">
        This Actuator is invalid
      </q-alert>

      <q-carousel quick-nav class="col" v-model="slideIndex">
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <q-card-main class="column col">
              <q-field class="col" label="Setting">
                <InputPopupEdit type="number" label="Setting" :field="block.data.setting" :change="callAndSaveBlock(v => block.data.setting = v)" />
              </q-field>
              <q-field class="col" label="Value">
                <big>{{ block.data.value | round }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>

        <!-- Settings -->
        <q-carousel-slide class="unpadded">
          <div :class="['widget-body', orientationClass]">
            <!-- Setting -->
            <q-card-main class="column col">
              <q-item class="full-width text-center">Setting</q-item>
              <q-field class="col" label="Minimum">
                <InputPopupEdit type="number" label="Minimum setting" :field="block.data.minSetting" :change="callAndSaveBlock(v => block.data.minSetting = v)" />
              </q-field>
              <q-field class="col" label="Current">
                <InputPopupEdit type="number" label="Current setting" :field="block.data.setting" :change="callAndSaveBlock(v => block.data.setting = v)" />
              </q-field>
              <q-field class="col" label="Maximum">
                <InputPopupEdit type="number" label="Maximum setting" :field="block.data.maxSetting" :change="callAndSaveBlock(v => block.data.maxSetting = v)" />
              </q-field>
            </q-card-main>
            <!-- Value -->
            <q-card-main class="column col">
              <q-item class="full-width text-center">Value</q-item>
              <q-field class="col" label="Minimum">
                <InputPopupEdit type="number" label="Minimum value" :field="block.data.minValue" :change="callAndSaveBlock(v => block.data.minValue = v)" />
              </q-field>
              <q-field class="col" label="Current">
                <big>{{ block.data.value | round }}</big>
              </q-field>
              <q-field class="col" label="Maximum">
                <InputPopupEdit type="number" label="Maximum value" :field="block.data.maxValue" :change="callAndSaveBlock(v => block.data.maxValue = v)" />
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
        <q-carousel-slide class="unpadded">
          <BlockGraph :id="widgetId" :config="graphCfg" :change="v => graphCfg = v" />
        </q-carousel-slide>
      </q-carousel>

    </q-card>
  </div>
</template>

<style scoped>
</style>

