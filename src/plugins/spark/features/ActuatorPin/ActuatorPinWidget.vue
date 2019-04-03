<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById, state } from './getters';
import { ActuatorPinBlock } from './state';

@Component
export default class ActuatorPinWidget extends BlockWidget {
  get block(): ActuatorPinBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }

  get subtitles() {
    return [
      'State',
      'Constraints',
      'Graph',
    ];
  }

  get pending() {
    if (!this.block.data.constrainedBy) {
      return null;
    }
    const { unconstrained } = this.block.data.constrainedBy;
    if (this.block.data.state === unconstrained) {
      return null;
    }
    return state[unconstrained];
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
      <ActuatorPinForm v-if="modalOpen" v-bind="formProps"/>
    </q-dialog>

    <BlockWidgetToolbar :field="me" graph/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>State</q-item-label>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>

          <ActuatorState
            :field="block.data.state"
            :change="callAndSaveBlock(v => block.data.state = v)"
            :disable="isDriven"
          />
        </q-item-section>
        <q-item-section v-if="pending !== null" dark style="justify-content: space-between">
          <q-item-label caption>pending</q-item-label>
          <span>{{ pending }}</span>
        </q-item-section>
      </q-item>
      <q-item dark>
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
