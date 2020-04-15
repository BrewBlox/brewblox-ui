<script lang="ts">
import { Component } from 'vue-property-decorator';

import { mutate } from '@/helpers/functional';
import { Link } from '@/helpers/units';
import { blockTypes } from '@/plugins/spark/block-types';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { Block } from '@/plugins/spark/types';

import { DigitalActuatorBlock } from './types';

const typeName = blockTypes.DigitalActuator;

@Component
export default class DigitalActuatorWidget
  extends BlockWidgetBase<DigitalActuatorBlock> {

  get hwBlock(): Block | null {
    return this.sparkModule.blockById(this.block.data.hwDevice.id);
  }

  get claimedChannels(): { [channel: number]: string } {
    if (!this.hwBlock) {
      return {};
    }
    const targetId = this.hwBlock.id;
    return this.sparkModule
      .blocks
      .filter(block => block.type === typeName && block.data.hwDevice.id === targetId)
      .reduce((acc, block) => mutate(acc, block.data.channel, block.id), {});
  }

  pinOptName(idx: number): string {
    const driver = this.claimedChannels[idx + 1];
    const [name] = Object.keys(this.hwBlock!.data.pins[idx]);
    return driver && driver !== this.block.id
      ? `${name} (replace '${driver}')`
      : name;
  }

  get channelOpts(): SelectOption[] {
    const opts = [{ label: 'Not set', value: 0 }];
    if (this.hwBlock) {
      opts.push(
        ...Object.keys(this.hwBlock.data.pins || this.hwBlock.data.channels)
          .map((k, idx) => ({ label: this.pinOptName(idx), value: idx + 1 })));
    }
    return opts;
  }

  async claimChannel(pinId: number): Promise<void> {
    if (this.block.data.channel === pinId) {
      return;
    }
    const currentDriver = new Link(this.claimedChannels[pinId] || null, typeName);
    if (currentDriver.id) {
      const currentDriverBlock = this.sparkModule.blockById<DigitalActuatorBlock>(currentDriver.id)!;
      currentDriverBlock.data.channel = 0;
      await this.sparkModule.saveBlock(currentDriverBlock);
    }
    this.block.data.channel = pinId;
    await this.saveBlock();
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph
        :graph-id="widget.id"
        :config="graphCfg"
        :refresh-trigger="mode"
        use-presets
        @params="saveGraphParams"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!block.data.hwDevice.id || !block.data.channel">
        <template #message>
          <span>Digital Actuator has no channel selected.</span>
        </template>
      </CardWarning>

      <div class="widget-body row">
        <LabeledField
          class="col"
          tag-class="full-width row justify-center"
        >
          <DigitalStateButton
            :value="block.data.desiredState"
            :pending="block.data.state !== block.data.desiredState"
            :pending-reason="constrainers"
            :disable="isDriven"
            dense
            class="col-auto"
            @input="v => { block.data.desiredState = v; saveBlock(); }"
          />
        </LabeledField>

        <template v-if="mode === 'Full'">
          <div class="col-break" />

          <LinkField
            :value="block.data.hwDevice"
            :service-id="serviceId"
            :creatable="false"
            title="Pin Array"
            label="Target Pin Array"
            class="col-grow"
            @input="v => { block.data.hwDevice = v; block.data.channel = 0; saveBlock(); }"
          />
          <SelectField
            :value="block.data.channel"
            :options="channelOpts"
            :readonly="!block.data.hwDevice.id"
            title="Pin Channel"
            label="Pin Channel"
            class="col-grow"
            @input="claimChannel"
          />
          <LabeledField
            label="Invert"
            class="col-grow"
          >
            <q-toggle
              :value="block.data.invert"
              dense
              @input="v => { block.data.invert = v; saveBlock(); }"
            />
          </LabeledField>
        </template>

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
  </GraphCardWrapper>
</template>
