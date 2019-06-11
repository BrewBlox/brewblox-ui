<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockForm from '@/plugins/spark/components/BlockForm';

import { DS2408Block } from './types';

@Component
export default class DS2408Form extends BlockForm {
  readonly block!: DS2408Block;
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
            This block is the DS2408 chip with 8 channels.
            Please create a Digital Actuator block for each of the channels you want to use.
          </span>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
