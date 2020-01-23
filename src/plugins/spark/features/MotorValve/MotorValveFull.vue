<script lang="ts">
import { Component } from 'vue-property-decorator';

import { spaceCased } from '@/helpers/functional';
import { mutate } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

import { ValveStartId } from '../DS2408/types';
import { typeName } from './getters';
import { MotorValveBlock, ValveState } from './types';

@Component
export default class MotorValveFull
  extends BlockCrudComponent<MotorValveBlock> {

  get hwBlock(): Block | null {
    const blockId = this.block.data.hwDevice.id;
    return !!blockId
      ? sparkStore.blockById(this.serviceId, blockId)
      : null;
  }

  get claimedChannels(): { [channel: number]: string } {
    if (!this.hwBlock) {
      return {};
    }
    const targetId = this.hwBlock.id;
    return sparkStore.blockValues(this.serviceId)
      .filter(block => block.type === typeName && block.data.hwDevice.id === targetId)
      .reduce((acc, block) => mutate(acc, block.data.startChannel, block.id), {});
  }

  get valveStateName(): string {
    return spaceCased(ValveState[this.block.data.valveState]);
  }

  driverStr(pinId: number): string {
    const driver = this.claimedChannels[pinId];
    return driver && driver !== this.block.id
      ? ` (replace '${driver}')`
      : '';
  }

  get channelOpts(): SelectOption[] {
    return [
      { label: 'Not set', value: 0 },
      ...Object.keys(ValveStartId)
        .map(Number)
        .filter(id => !Number.isNaN(id))
        .map(id => ({ label: `${ValveStartId[id]}${this.driverStr(id)}`, value: id })),
    ];
  }

  async claimChannel(pinId: number): Promise<void> {
    if (this.block.data.startChannel === pinId) {
      return;
    }
    const currentDriver = new Link(this.claimedChannels[pinId] || null, typeName);
    if (currentDriver.id) {
      const currentDriverBlock: MotorValveBlock = sparkStore.blockById(this.serviceId, currentDriver.id);
      currentDriverBlock.data.startChannel = 0;
      await sparkStore.saveBlock([this.serviceId, currentDriverBlock]);
    }
    this.block.data.startChannel = pinId;
    await this.saveBlock();
  }
}
</script>

<template>
  <div class="widget-md">
    <slot name="warnings" />

    <div class="widget-body row">
      <BlockField
        :value="block.data.hwDevice"
        :service-id="serviceId"
        title="Target DS2408 Chip"
        label="Target DS2408 Chip"
        no-create
        class="col-grow"
        @input="v => { block.data.hwDevice = v; block.data.startChannel = 0; saveBlock(); }"
      />
      <SelectField
        :value="block.data.startChannel"
        :options="channelOpts"
        :readonly="!block.data.hwDevice.id"
        title="DS2408 Channel"
        label="DS2408 Channel"
        class="col-grow"
        @input="claimChannel"
      />
      <div class="col-break" />
      <LabeledField
        label="State"
        class="col-grow"
      >
        <DigitalStateButton
          :value="block.data.desiredState"
          :pending="block.data.state !== block.data.desiredState"
          :pending-reason="constrainers"
          :disable="isDriven"
          @input="v => { block.data.desiredState = v; saveBlock(); }"
        />
      </LabeledField>
      <LabeledField
        :value="valveStateName"
        label="Valve State"
        class="col-grow"
      />
      <div class="col-break" />
      <DrivenIndicator
        :block-id="block.id"
        :service-id="serviceId"
        class="col-grow"
      />
      <ConstraintsField
        :value="block.data.constrainedBy"
        :service-id="serviceId"
        type="digital"

        class="col-grow"
        @input="v => { block.data.constrainedBy = v; saveBlock(); }"
      />
    </div>
  </div>
</template>
