<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorDS2413Block } from './state';

@Component
export default class ActuatorDS2413Widget extends BlockWidget {
  get block(): ActuatorDS2413Block {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get renamedTargets() {
    return {
      state: 'State',
    };
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorDS2413Form v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>State</q-item-section>
        <q-item-section>
          <ActuatorState
            :field="block.data.state"
            :change="callAndSaveBlock(v => block.data.state = v)"
            :disable="isDriven"
          />
        </q-item-section>
      </q-item>
      <q-item v-if="isDriven">
        <q-item-section>Driven</q-item-section>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-label>Constraints</q-item-label>
        <q-item-section>
          <DigitalConstraints
            :service-id="serviceId"
            :field="block.data.constrainedBy"
            :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
            readonly
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
