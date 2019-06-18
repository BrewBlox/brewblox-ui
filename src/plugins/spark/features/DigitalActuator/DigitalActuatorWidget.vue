<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { DigitalActuatorBlock } from './types';

@Component
export default class DigitalActuatorWidget extends BlockWidget {
  readonly block!: DigitalActuatorBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me"/>

    <q-card-section>
      <template v-if="!block.data.hwDevice.id || !block.data.channel">
        <q-item dark>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>No pin selected</q-item-section>
        </q-item>
      </template>

      <template v-else>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>State</q-item-label>
            <DigitalStateField
              :value="block.data.desiredState"
              :disable="isDriven"
              @input="v => { block.data.desiredState = v; saveBlock(); }"
            />
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <DigitalConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly/>
          </q-item-section>
        </q-item>
      </template>
    </q-card-section>
  </q-card>
</template>
