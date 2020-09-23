<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { DS2408StartChannels } from '@/plugins/spark/getters';
import { isCompatible } from '@/plugins/spark/helpers';
import {
  BlockIntfType,
  DigitalActuatorBlock,
  DS2408Block,
  DS2408ConnectMode,
  MotorValveBlock,
} from '@/plugins/spark/types';

@Component
export default class DS2408Widget
  extends BlockWidgetBase<DS2408Block> {
  mapping = DS2408StartChannels;

  connectModeOpts: SelectOption<DS2408ConnectMode>[] = [
    { label: '2 valves', value: DS2408ConnectMode.CONNECT_VALVE },
    { label: '8 IO pins', value: DS2408ConnectMode.CONNECT_ACTUATOR },
  ];

  get valveMode(): boolean {
    return this.block.data.connectMode === DS2408ConnectMode.CONNECT_VALVE;
  }

  setConnectMode(mode: DS2408ConnectMode): void {
    if (!mode || this.block.data.connectMode === mode) {
      return;
    }
    const linked = this.sparkModule
      .blocks
      .filter((block): block is DigitalActuatorBlock | MotorValveBlock =>
        isCompatible(block.type, BlockIntfType.ActuatorDigitalInterface))
      .filter(block => block.data.hwDevice.id === this.blockId);

    if (linked.length) {
      const names = linked
        .map(block => `'${block.id}'`)
        .join(', ');
      const verbs = linked.length > 1
        ? ['have', 'them']
        : ['has', 'it'];
      createDialog({
        component: 'SaveConfirmDialog',
        title: 'Switch DS2408 mode',
        message: `${names} ${verbs[0]} this block set as output. Do you wish to unlink ${verbs[1]}?`,
        saveFunc: () =>
          linked.forEach(block => {
            block.data.hwDevice.id = null;
            this.sparkModule.saveBlock(block);
          }),
      })
        .onOk(() => {
          this.block.data.connectMode = mode;
          this.saveBlock();
        });
    }
    else {
      this.block.data.connectMode = mode;
      this.saveBlock();
    }
  }
}
</script>

<template>
  <CardWrapper
    v-bind="{context}"
  >
    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!block.data.connected">
        <template #message>
          DS2408 is not connected
        </template>
      </CardWarning>
      <div class="column">
        <q-btn-toggle
          :value="block.data.connectMode"
          :options="connectModeOpts"
          outline
          class="self-center q-my-md"
          @input="setConnectMode"
        />
      </div>
      <ValveArray v-if="valveMode" :crud="crud" :mapping="mapping" />
      <IoArray v-else :crud="crud" />

      <template v-if="mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
          <LabeledField
            :value="block.data.connected ? 'Yes' : 'No'"
            label="Connected"
            class="col-grow"
          />
          <InputField
            :value="block.data.address"
            title="Address"
            label="Address"
            class="col-grow"
            @input="v => { block.data.address = v; saveBlock(); }"
          />
        </div>
      </template>
    </div>
  </CardWrapper>
</template>
