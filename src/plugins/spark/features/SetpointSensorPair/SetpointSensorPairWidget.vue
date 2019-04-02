<script lang="ts">
import { postfixedDisplayNames } from '@/helpers/units';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { SetpointSensorPairBlock } from './state';

@Component
export default class SetpointSensorPairWidget extends BlockWidget {
  get block(): SetpointSensorPairBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return postfixedDisplayNames(
      {
        setpointValue: 'Setpoint',
        sensorValue: 'Sensor',
      },
      this.block.data,
    );
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <SetpointSensorPairForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Setpoint</q-item-label>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          <div>
            <big>{{ block.data.setpointValue.val | round }}</big>
            <span class="q-ml-xs">{{ block.data.setpointValue.notation }}</span>
          </div>
        </q-item-section>
        <q-item-section>
          <q-item-label caption>Sensor</q-item-label>
          <div>
            <big>{{ block.data.sensorValue.val | round }}</big>
            <span class="q-ml-xs">{{ block.data.sensorValue.notation }}</span>
          </div>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
