<script lang="ts">
import { serializedPropertyName } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { filters, getById } from './getters';
import { PidBlock } from './state';

@Component
export default class PidWidget extends BlockWidget {
  get block(): PidBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
      'Input/Output',
      'Settings',
      'Graph',
    ];
  }

  get renamedTargets() {
    return {
      [serializedPropertyName('error', this.block.data)]: 'Error (filtered)',
      [serializedPropertyName('derivative', this.block.data)]: 'Derivative or error',
      [serializedPropertyName('integral', this.block.data)]: 'Integral of error',
      [serializedPropertyName('p', this.block.data)]: 'Proportional action',
      [serializedPropertyName('i', this.block.data)]: 'Integral action',
      [serializedPropertyName('d', this.block.data)]: 'Derivative action',
      [serializedPropertyName('inputValue', this.block.data)]: 'Input value',
      [serializedPropertyName('inputSetting', this.block.data)]: 'Input target',
      [serializedPropertyName('outputValue', this.block.data)]: 'Output value',
      [serializedPropertyName('outputSetting', this.block.data)]: 'Output target',
    };
  }

  get filterName() {
    return filters[this.block.data.filter];
  }

  get filterOpts() {
    return filters.map((filter, idx) => ({ label: filter, value: idx }));
  }
}
</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen">
      <PidForm v-if="modalOpen" :field="block" :change="saveBlock" :change-id="changeBlockId"/>
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
      <q-btn slot="right" flat dense round icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="refreshBlock"/>
    </q-card-title>
    <q-card-separator/>
    <q-alert v-if="!block.data.enabled" type="info" color="info">This PID is disabled</q-alert>
    <q-alert
      v-if="block.data.enabled && !block.data.active"
      type="warning"
      color="warn"
    >This PID is inactive</q-alert>
    <q-carousel v-model="slideIndex" quick-nav class="col">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <div :class="['widget-body', orientationClass]">
          <q-card-main class="column col">
            <q-field class="col" label="Error">
              <big>{{ block.data.error | unit }}</big>
            </q-field>
            <q-field class="col" label="Integral">
              <big>{{ block.data.integral | unit }}</big>
            </q-field>
            <q-field class="col" label="Derivative">
              <big>{{ block.data.derivative | unit }}</big>
            </q-field>
          </q-card-main>
          <q-card-main class="column col">
            <q-field class="col" label="P">
              <big>{{ block.data.p | round }}</big>
            </q-field>
            <q-field class="col" label="I">
              <big>{{ block.data.i | round }}</big>
            </q-field>
            <q-field class="col" label="D">
              <big>{{ block.data.d | round }}</big>
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <q-carousel-slide class="unpadded">
        <div :class="orientationClass">
          <q-card-main class="column col">
            <q-item class="full-width text-center">Input</q-item>
            <q-field class="col" label="Target">
              <big>{{ block.data.inputSetting | unit }}</big>
            </q-field>
            <q-field class="col" label="Actual">
              <big>{{ block.data.inputValue | unit }}</big>
            </q-field>
          </q-card-main>
          <q-card-main class="column col">
            <q-item class="full-width text-center">Output</q-item>
            <q-field class="col" label="Target">
              <big>{{ block.data.outputSetting | unit }}</big>
            </q-field>
            <q-field class="col" label="Actual">
              <big>{{ block.data.outputValue | unit }}</big>
            </q-field>
          </q-card-main>
        </div>
      </q-carousel-slide>
      <q-carousel-slide class="unpadded">
        <div :class="orientationClass">
          <q-card-main class="column col">
            <q-field class="col" label="Kp">
              <UnitPopupEdit
                :field="block.data.kp"
                :change="callAndSaveBlock(v => block.data.kp = v)"
                label="Kp"
              />
            </q-field>
            <q-field class="col" label="Ti">
              <UnitPopupEdit
                :field="block.data.ti"
                :change="callAndSaveBlock(v => block.data.ti = v)"
                label="Ti"
              />
            </q-field>
            <q-field class="col" label="Td">
              <UnitPopupEdit
                :field="block.data.td"
                :change="callAndSaveBlock(v => block.data.td = v)"
                label="Td"
              />
            </q-field>
          </q-card-main>
          <q-card-main class="column col">
            <q-field class="col" label="Filter">
              <SelectPopupEdit
                :field="block.data.filter"
                :change="callAndSaveBlock(v => block.data.filter = v)"
                :options="filterOpts"
                label="Filter"
              />
            </q-field>
            <q-field class="col" label="Filter threshold">
              <UnitPopupEdit
                :field="block.data.filterThreshold"
                :change="callAndSaveBlock(v => block.data.filterThreshold = v)"
                label="Filter threshold"
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
