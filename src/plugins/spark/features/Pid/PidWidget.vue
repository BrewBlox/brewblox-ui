<script lang="ts">
import Component from 'vue-class-component';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { saveBlock } from '@/plugins/spark/store/actions';
import { PidBlock } from './state';
import { getById, filters } from './getters';
import FormBase from '@/components/Widget/FormBase';
import { GraphConfig } from '@/components/Graph/state';
import { QueryParams } from '@/store/history/state';

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
      [`kp[${this.block.data.kp.unit}]`]: 'Kp',
      [`ti[${this.block.data.ti.unit}]`]: 'Ti',
      [`td[${this.block.data.td.unit}]`]: 'Td',
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
  <div>
    <q-modal v-model="modalOpen">
      <PidForm v-if="modalOpen" :field="block" :change="saveBlock" />
    </q-modal>

    <q-card dark class="full-height column">
      <q-card-title class="title-bar">
        <InputPopupEdit :field="widgetId" label="Widget ID" display="span" :change="v => widgetId = v" />
        <span class="vertical-middle on-left" slot="right">{{ this.subtitle }}</span>
        <q-btn slot="right" flat dense round @click="openModal" icon="settings" />
        <q-btn slot="right" flat round dense @click="refreshBlock" icon="refresh" />
      </q-card-title>
      <q-card-separator />

      <q-alert type="info" color="info" v-if="!this.block.data.enabled">
        This PID is disabled
      </q-alert>
      <q-alert type="warning" color="warn" v-if="this.block.data.enabled && !this.block.data.active">
        This PID is inactive
      </q-alert>

      <q-carousel quick-nav class="col" v-model="slideIndex">
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
                <big>{{ block.data.inputValid ? block.data.inputSetting : '-' | unit }}</big>
              </q-field>
              <q-field class="col" label="Actual">
                <big>{{ block.data.inputValid ? block.data.inputValue : '-' | unit }}</big>
              </q-field>
            </q-card-main>

            <q-card-main class="column col">
              <q-item class="full-width text-center">Output</q-item>
              <q-field class="col" label="Target">
                <big>{{ block.data.outputValid ? block.data.outputSetting : '-' | unit }}</big>
              </q-field>
              <q-field class="col" label="Actual">
                <big>{{ block.data.outputValid ? block.data.outputValue : '-' | unit }}</big>
              </q-field>
            </q-card-main>
          </div>
        </q-carousel-slide>
        <q-carousel-slide class="unpadded">
          <div :class="orientationClass">
            <q-card-main class="column col">
              <q-field class="col" label="Kp">
                <UnitPopupEdit label="Kp" :field="block.data.kp" :change="callAndSaveBlock(v => block.data.kp = v)" />
              </q-field>
              <q-field class="col" label="Ti">
                <UnitPopupEdit label="Ti" :field="block.data.ti" :change="callAndSaveBlock(v => block.data.ti = v)" />
              </q-field>
              <q-field class="col" label="Td">
                <UnitPopupEdit label="Td" :field="block.data.td" :change="callAndSaveBlock(v => block.data.td = v)" />
              </q-field>
            </q-card-main>

            <q-card-main class="column col">
              <q-field class="col" label="Filter">
                <SelectPopupEdit label="Filter" :field="block.data.filter" :change="callAndSaveBlock(v => block.data.filter = v)" :options="filterOpts" />
              </q-field>
              <q-field class="col" label="Filter threshold">
                <UnitPopupEdit label="Filter threshold" :field="block.data.filterThreshold" :change="callAndSaveBlock(v => block.data.filterThreshold = v)" />
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
