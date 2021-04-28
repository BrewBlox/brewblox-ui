<script lang="ts">
import { computed, defineComponent, onBeforeMount, PropType } from 'vue';

import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import {
  Block,
  BlockIntfType,
  BlockType,
  DS2408Block,
  DS2413Block,
  TempSensorOneWireBlock,
} from '@/plugins/spark/types';
import { discoverBlocks, isCompatible, makeBlockIdRules } from '@/plugins/spark/utils';
import { featureStore } from '@/store/features';
import { prettyQty } from '@/utils/bloxfield';
import { createBlockDialog, createDialog } from '@/utils/dialog';
import { objectStringSorter } from '@/utils/functional';

import { QuickstartConfig } from '../types';

export default defineComponent({
  name: 'QuickstartDiscoveryTask',
  props: {
    config: {
      type: Object as PropType<QuickstartConfig>,
      required: true,
    },
  },
  emits: [
    'back',
    'next',
  ],
  setup(props) {
    const serviceId = computed<string>(
      () => props.config.serviceId,
    );

    const sparkModule = computed<SparkServiceModule | null>(
      () => sparkStore.moduleById(serviceId.value),
    );

    const discoveredBlocks = computed<Block[]>(
      () => sparkModule.value
        ?.blocks
        .filter(block => isCompatible(block.type, BlockIntfType.OneWireDeviceInterface))
        .sort(objectStringSorter('id'))
        ?? [],
    );

    function about(block: Block): string {
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

    function widgetTitle(block: Block): string {
      return featureStore.widgetTitle(block.type);
    }

    async function discover(): Promise<void> {
      const discovered = await discoverBlocks(serviceId.value);
      if (discovered.length) {
        await sparkModule.value?.fetchBlocks();
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
      })
        .onOk((newId: string) => {
          sparkModule.value?.renameBlock([block.id, newId]);
        });
    }

    onBeforeMount(() => discover());

    return {
      discover,
      discoveredBlocks,
      about,
      widgetTitle,
      show,
      rename,
    };
  },
});
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
  </ActionCardBody>
</template>
