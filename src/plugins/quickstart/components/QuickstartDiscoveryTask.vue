<script setup lang="ts">
import { UseTaskEmits, UseTaskProps } from '../composables';
import { QuickstartConfig } from '../types';
import { useSparkStore } from '@/plugins/spark/store';
import { discoverBlocks } from '@/plugins/spark/utils/actions';
import { makeBlockIdRules } from '@/plugins/spark/utils/configuration';
import { isCompatible } from '@/plugins/spark/utils/info';
import { useFeatureStore } from '@/store/features';
import { createBlockDialog } from '@/utils/block-dialog';
import { createDialog } from '@/utils/dialog';
import { makeObjectSorter } from '@/utils/functional';
import { matchesType } from '@/utils/objects';
import { prettyQty } from '@/utils/quantity';
import {
  Block,
  BlockIntfType,
  BlockType,
  DS2408Block,
  DS2413Block,
  OneWireGpioModuleBlock,
  TempSensorOneWireBlock,
} from 'brewblox-proto/ts';
import { computed, onBeforeMount } from 'vue';

const props = defineProps<UseTaskProps<QuickstartConfig>>();

defineEmits<UseTaskEmits<QuickstartConfig>>();

const serviceId = computed<string>(() => props.config.serviceId);
const sparkStore = useSparkStore();
const featureStore = useFeatureStore();

const discoveredBlocks = computed<Block[]>(
  () =>
    sparkStore
      .blocksByService(serviceId.value)
      .filter((block) =>
        isCompatible(block.type, [
          BlockIntfType.OneWireDeviceInterface,
          BlockType.OneWireGpioModule,
        ]),
      )
      .sort(makeObjectSorter('id')) ?? [],
);

function about(block: Block): string {
  if (matchesType<TempSensorOneWireBlock>(BlockType.TempSensorOneWire, block)) {
    return prettyQty(block.data.value);
  }

  if (matchesType<OneWireGpioModuleBlock>(BlockType.OneWireGpioModule, block)) {
    return `Position ${block.data.modulePosition}`;
  }

  if (isCompatible(block.type, [BlockType.DS2408, BlockType.DS2413])) {
    const typed = block as DS2408Block | DS2413Block;
    return typed.data.connected ? '' : 'disconnected';
  }

  return '';
}

function widgetTitle(block: Block): string {
  return featureStore.widgetTitle(block.type);
}

async function discover(): Promise<void> {
  const discovered = await discoverBlocks(serviceId.value);
  if (discovered.length) {
    await sparkStore.fetchBlocks(serviceId.value);
  }
}

function show(block: Block): void {
  createBlockDialog(block);
}

function rename(block: Block): void {
  createDialog({
    component: 'InputDialog',
    componentProps: {
      title: 'Change block name',
      message: `Choose a new name for '${block.id}'`,
      rules: makeBlockIdRules(serviceId.value),
      clearable: false,
      modelValue: block.id,
    },
  }).onOk((newId: string) => {
    sparkStore.renameBlock(block.serviceId, block.id, newId);
  });
}

onBeforeMount(() => discover());
</script>

<template>
  <QuickstartCard>
    <q-card-section>
      <q-item class="text-weight-light">
        <q-item-section>
          <q-item-label class="text-subtitle1">
            Discovered blocks
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
            OneWire devices are discovered after they are plugged in. <br />
            Here you can give your discovered blocks a meaningful name.
          </p>
          <p>
            If you unplug a discovered device, it will be shown as disconnected.
            <br />
            Use this to quickly identify its block.
          </p>
          <p>
            If a device is not shown below, please ensure it is plugged in, and
            click the <b>Discover</b> button.
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
            @click="rename(block)"
          >
            <q-item>
              <q-item-section>
                <q-item-label
                  caption
                  class="text-italic darkish"
                >
                  {{ widgetTitle(block) }}
                </q-item-label>
                <div style="font-size: larger">
                  {{ block.id }}
                </div>
              </q-item-section>
              <q-item-section class="col-auto">
                {{ about(block) }}
              </q-item-section>
            </q-item>
            <q-tooltip> Rename block </q-tooltip>
          </div>
          <q-btn
            flat
            round
            icon="mdi-launch"
            class="self-center"
            @click="show(block)"
          >
            <q-tooltip> Show block settings </q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <template #actions>
      <q-btn
        unelevated
        label="Back"
        @click="$emit('back')"
      />
      <q-space />
      <q-btn
        unelevated
        label="Next"
        color="primary"
        @click="$emit('next')"
      />
    </template>
  </QuickstartCard>
</template>
