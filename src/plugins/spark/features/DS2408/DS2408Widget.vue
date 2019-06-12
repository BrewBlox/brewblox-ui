<script lang="ts">
import { Component } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ChannelConfig } from '../../types';
import { DS2408Block } from './types';

@Component
export default class DS2408Widget extends BlockWidget {
  readonly block!: DS2408Block;

  configName(cfg: ChannelConfig) {
    return spaceCased(ChannelConfig[cfg]);
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me">
      <template v-slot:actions>
        <CreateActuatorsAction :block="block"/>
      </template>
    </BlockWidgetToolbar>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
        <q-item-section>
          <div
            v-for="(ch, idx) in block.data.channels"
            :key="idx"
          >Channel {{ idx + 1 }}: {{ configName(ch.config) }}</div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
