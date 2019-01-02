<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorAnalogMockBlock } from './state';

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
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <ActuatorAnalogMockForm
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
    <q-alert v-if="block.value === null" type="warning" color="warning">This Actuator is invalid</q-alert>
    <q-carousel v-model="slideIndex" quick-nav class="col">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Setting">
              <InputPopupEdit
                :field="block.data.setting"
                :change="callAndSaveBlock(v => block.data.setting = v)"
                type="number"
                label="Setting"
              />
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
              <InputPopupEdit
                :field="block.data.minSetting"
                :change="callAndSaveBlock(v => block.data.minSetting = v)"
                type="number"
                label="Minimum setting"
              />
            </q-field>
            <q-field class="col" label="Current">
              <InputPopupEdit
                :field="block.data.setting"
                :change="callAndSaveBlock(v => block.data.setting = v)"
                type="number"
                label="Current setting"
              />
            </q-field>
            <q-field class="col" label="Maximum">
              <InputPopupEdit
                :field="block.data.maxSetting"
                :change="callAndSaveBlock(v => block.data.maxSetting = v)"
                type="number"
                label="Maximum setting"
              />
            </q-field>
          </q-card-main>
          <!-- Value -->
          <q-card-main class="column col">
            <q-item class="full-width text-center">Value</q-item>
            <q-field class="col" label="Minimum">
              <InputPopupEdit
                :field="block.data.minValue"
                :change="callAndSaveBlock(v => block.data.minValue = v)"
                type="number"
                label="Minimum value"
              />
            </q-field>
            <q-field class="col" label="Current">
              <big>{{ block.data.value | round }}</big>
            </q-field>
            <q-field class="col" label="Maximum">
              <InputPopupEdit
                :field="block.data.maxValue"
                :change="callAndSaveBlock(v => block.data.maxValue = v)"
                type="number"
                label="Maximum value"
              />
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
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

