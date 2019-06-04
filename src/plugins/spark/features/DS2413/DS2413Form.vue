<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { DS2413Block } from './types';

@Component
export default class DS2413Form extends BlockForm {
  block!: DS2413Block;

  defaultData() {
    return {
      address: '',
      state: 2,
    };
  }

  presets() {
    return [];
  }

  created() {
    this.block; // ensure getter is evaluated
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Note</q-item-label>
          <span>
            This block is the DS2413 chip with 2 channels.
            Please create a DS2413 Actuator block for each of the channels you want to use.
          </span>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
