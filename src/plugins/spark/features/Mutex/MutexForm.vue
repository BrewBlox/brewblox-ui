<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { MutexBlock } from './types';

@Component
export default class MutexForm extends BlockCrudComponent {
  readonly block!: MutexBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar :crud="crud" />

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Idle time before allowing a different actuator</q-item-label>
          <TimeUnitField
            :value="block.data.differentActuatorWait"
            title="Minimum idle time"
            @input="v => { block.data.differentActuatorWait = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
