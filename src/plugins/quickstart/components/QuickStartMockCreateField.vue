<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { ruleValidator, suggestId } from '@/helpers/functional';
import notify from '@/helpers/notify';
import { blockIdRules } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { BlockType, TempSensorMockBlock } from '@/plugins/spark/types';
import { SparkStatus } from '@/plugins/spark/types';


@Component
export default class QuickStartMockCreateField extends Vue {
  finished = false;

  @Prop({ type: String, required: true })
  public readonly serviceId!: string;

  @Prop({ type: Array, required: true })
  public readonly names!: string[];

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get status(): SparkStatus | null {
    return this.sparkModule?.status ?? null;
  }

  get isSimulation(): boolean {
    return this.status?.connectionKind === 'simulation';
  }

  async createMockSensors(): Promise<void> {
    if (!this.sparkModule) { return; }
    const validator = ruleValidator(blockIdRules(this.serviceId));
    const spec = sparkStore.specById<TempSensorMockBlock>(BlockType.TempSensorMock);

    for (const name of this.names) {
      const block: TempSensorMockBlock = {
        id: suggestId(name, validator),
        serviceId: this.serviceId,
        groups: [0],
        type: BlockType.TempSensorMock,
        data: spec.generate(),
      };
      await this.sparkModule.createBlock(block);
      notify.done(`Created sensor <i>${block.id}</i>`);
    }

    this.finished = true;
  }
}
</script>

<template>
  <q-item v-if="isSimulation && !finished">
    <q-item-section>
      <div
        class="clickable rounded-borders q-pa-sm row"
        @click="createMockSensors"
      >
        <q-icon
          size="md"
          name="warning"
          color="warning"
          class="col-auto self-center q-mr-sm"
        />
        <div class="col-grow text-italic">
          '{{ serviceId }}' is a simulation service without physical sensors. <br>
          Click here to create Temp Sensor (Mock) blocks.
        </div>
      </div>
    </q-item-section>
  </q-item>
</template>
