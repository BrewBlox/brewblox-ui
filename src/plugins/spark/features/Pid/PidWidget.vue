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
      <BlockGraph slot="right" :id="widgetId" :config="graphCfg" :change="v => graphCfg = v"/>
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

    <q-card-main class="column widget-body">
      <div :style="gridStyle(6)" class="full-width">
        <q-item>Input</q-item>
        <q-field label="Target">
          <big>{{ block.data.inputSetting | unit }}</big>
        </q-field>
        <q-field label="Actual">
          <big>{{ block.data.inputValue | unit }}</big>
        </q-field>
        <q-item>Output</q-item>
        <q-field label="Target">
          <big>{{ block.data.outputSetting | round }}</big>
        </q-field>
        <q-field label="Actual">
          <big>{{ block.data.outputValue | round }}</big>
        </q-field>
      </div>
      <div :style="gridStyle(8)" class="full-width">
        <q-item>State</q-item>
        <q-field label="Error">
          <big>{{ block.data.error | unit }}</big>
        </q-field>
        <q-field label="Integral">
          <big>{{ block.data.integral | unit }}</big>
        </q-field>
        <q-field label="Derivative">
          <big>{{ block.data.derivative | unit }}</big>
        </q-field>
        <q-item>Result</q-item>
        <q-field label="P">
          <big>{{ block.data.p | round }}</big>
        </q-field>
        <q-field label="I">
          <big>{{ block.data.i | round }}</big>
        </q-field>
        <q-field label="D">
          <big>{{ block.data.d | round }}</big>
        </q-field>
      </div>
    </q-card-main>
  </q-card>
</template>

<style lang="stylus" scoped>
/deep/ .widget-body .q-field * {
  padding-top: 0px !important;
  margin-top: 0px !important;
}

/deep/ .widget-body .q-item {
  padding: 0;
  min-height: 0;
}
</style>
