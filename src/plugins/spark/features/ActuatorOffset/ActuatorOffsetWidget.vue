<script lang="ts">
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import Component from 'vue-class-component';
import { getById } from './getters';
import { ActuatorOffsetBlock } from './state';

@Component
export default class ActuatorOffsetWidget extends BlockWidget {
  get block(): ActuatorOffsetBlock {
    return getById(this.$store, this.serviceId, this.blockId);
  }
  get warnings() {
    const warn: string[] = [];
    if (!this.block.data.targetId === null) {
      warn.push('Driven process value invalid');
    }
    if (this.block.data.referenceId === null) {
      warn.push('Reference process value');
    }
    return warn.join(', ');
  }

  get renamedTargets() {
    return {
      setting: 'Target offset',
      value: 'Actual offset',
    };
  }

  enable() {
    this.block.data.enabled = true;
    this.saveBlock();
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ActuatorOffsetForm
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
      <q-item v-if="!block.data.enabled" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>
          <span>
            Offset is disabled:
            <i>{{ block.data.targetId }}</i> will not be changed.
          </span>
        </q-item-section>
        <q-item-section side>
          <q-btn text-color="white" flat label="Enable" @click="enable"/>
        </q-item-section>
      </q-item>

      <q-item dark>
        <q-item-section>Target offset</q-item-section>
        <q-item-section>
          <big>{{ block.data.setting | round }}</big>
        </q-item-section>
      </q-item>
      <q-item v-if="isDriven">
        <q-item-section>Driven</q-item-section>
        <q-item-section>
          <DrivenIndicator :block-id="block.id" :service-id="serviceId"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>Actual offset</q-item-section>
        <q-item-section>
          <big>{{ block.data.value | round }}</big>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-label>Constraints</q-item-label>
        <AnalogConstraints
          :service-id="serviceId"
          :field="block.data.constrainedBy"
          :change="callAndSaveBlock(v => block.data.constrainedBy = v)"
          readonly
        />
      </q-item>
    </q-card-section>
  </q-card>
</template>
