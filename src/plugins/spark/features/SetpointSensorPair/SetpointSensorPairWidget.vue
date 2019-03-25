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
      <SetpointSensorPairForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="saveBlock"
        :on-change-block-id="changeBlockId"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <div class="column">
            <span>Setpoint value</span>
            <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
          </div>
        </q-item-section>
        <q-item-section>
          <big>{{ block.data.setpointValue | unit }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Sensor value</q-item-section>
        <q-item-section>
          <big>{{ block.data.sensorValue | unit }}</big>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
