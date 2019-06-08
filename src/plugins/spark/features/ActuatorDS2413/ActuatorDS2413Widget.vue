<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { ActuatorDS2413Block } from './types';

@Component
export default class ActuatorDS2413Widget extends BlockWidget {
  readonly block!: ActuatorDS2413Block;

  get renamedTargets() {
    return {
      state: 'State',
    };
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>State</q-item-label>
          <ActuatorState
            :value="block.data.state"
            :disable="isDriven"
            @input="v => { block.data.state = v; saveBlock(); }"
          />
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <DigitalConstraints :value="block.data.constrainedBy" :service-id="serviceId" readonly/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
