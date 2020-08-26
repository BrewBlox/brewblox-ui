<script lang="ts">
import { Component } from 'vue-property-decorator';

import { prettyQty } from '@/helpers/bloxfield';
import { createBlockDialog, createDialog } from '@/helpers/dialog';
import { objectStringSorter } from '@/helpers/functional';
import { blockIdRules, discoverBlocks, isCompatible } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  Block,
  BlockIntfType,
  BlockType,
  DS2408Block,
  DS2413Block,
  TempSensorOneWireBlock,
} from '@/plugins/spark/types';

import { QuickStartOutput } from '../types';
import QuickStartTaskBase from './QuickStartTaskBase';

@Component
export default class QuickStartDiscoveryTask extends QuickStartTaskBase<QuickStartOutput> {

  mounted(): void {
    this.discover();
  }

  get serviceId(): string {
    return this.config.serviceId;
  }

  get sparkModule(): SparkServiceModule | null {
    return sparkStore.moduleById(this.serviceId);
  }

  get discoveredBlocks(): Block[] {
    return this.sparkModule
      ?.blocks
      .filter(block => isCompatible(block.type, BlockIntfType.OneWireDeviceInterface))
      .sort(objectStringSorter('id'))
      ?? [];
  }

  about(block: Block): string {
    if (block.type === BlockType.TempSensorOneWire) {
      const typed = block as TempSensorOneWireBlock;
      return prettyQty(typed.data.value);
    }

    if (isCompatible(block.type, BlockIntfType.IoArrayInterface)) {
      const typed = block as DS2408Block | DS2413Block;
      return typed.data.connected
        ? ''
        : 'disconnected';
    }

    return '';
  }

  async discover(): Promise<void> {
    const discovered = await discoverBlocks(this.serviceId);
    if (discovered.length) {
      await this.sparkModule?.fetchBlocks();
    }
  }

  show(block: Block): void {
    createBlockDialog(block);
  }

  rename(block: Block): void {
    createDialog({
      component: 'InputDialog',
      title: 'Change block name',
      message: `Choose a new name for '${block.id}'`,
      rules: blockIdRules(this.serviceId),
      clearable: false,
      value: block.id,
    })
      .onOk((newId: string) => {
        this.sparkModule?.renameBlock([block.id, newId]);
      });
  }
}
</script>

<template>
  <ActionCardBody>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Configure discovered blocks
          </q-item-label>
        </q-item-section>
        <q-item-section class="col-auto self-start">
          <q-btn
            flat
            color="secondary"
            label="Discover"
            icon="refresh"
            @click="discover"
          />
        </q-item-section>
      </q-item>
      <q-item class="text-weight-light">
        <q-item-section>
          <p>
            OneWire devices are discovered after they are plugged in. <br>
            Here you can give your discovered blocks a meaningful name.
          </p>
          <p>
            If you unplug a discovered device, it will be shown as disconnected. <br>
            Use this to quickly identify its block.
          </p>
          <p>
            If a device is not shown below,
            please ensure it is plugged in,
            and click the Discover button.
          </p>
        </q-item-section>
      </q-item>

      <div class="column q-gutter-y-sm q-pa-md">
        <div
          v-for="block in discoveredBlocks"
          :key="block.id"
          class="row no-wrap q-gutter-x-sm"
        >
          <div
            class="col-grow clickable rounded-borders"
            @click="show(block)"
          >
            <q-item>
              <q-item-section>
                <q-item-label caption class="text-italic darkish">
                  {{ block.type | widgetTitle }}
                </q-item-label>
                <div style="font-size: larger">
                  {{ block.id }}
                </div>
              </q-item-section>
              <q-item-section class="col-auto">
                {{ about(block) }}
              </q-item-section>
            </q-item>
            <q-tooltip>
              Show block settings
            </q-tooltip>
          </div>
          <q-btn
            flat
            round
            icon="edit"
            class="self-center"
            @click="rename(block)"
          >
            <q-tooltip>Rename block</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="back"
      />
      <q-space />
      <q-btn
        unelevated
        label="Next"
        color="primary"
        @click="next"
      />
    </template>
  </ActionCardBody>
</template>
