<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DS2408Block } from './types';

@Component
export default class DS2408Widget extends BlockWidget {
  readonly block!: DS2408Block;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me"/>

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
