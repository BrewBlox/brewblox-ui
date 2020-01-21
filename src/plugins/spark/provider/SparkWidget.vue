<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { WidgetContext } from '@/store/features';

import { blockTypes, SysInfoBlock, TicksBlock, WiFiSettingsBlock } from '../block-types';
import { isReady } from './getters';

@Component
export default class SparkWidget extends Vue {
  infoClass = 'col-lg-5 col-11';

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  @Prop({ type: Object, default: () => ({ mode: 'Basic', container: 'Dashboard' }) })
  public readonly context!: WidgetContext;

  get inDialog(): boolean {
    return this.context.container === 'Dialog';
  }

  sysBlock<T extends Block>(blockType: string): T {
    return sparkStore.blockValues(this.serviceId)
      .find(block => block.type === blockType) as T;
  }

  get sysInfo(): SysInfoBlock {
    return this.sysBlock(blockTypes.SysInfo);
  }

  get ticks(): TicksBlock {
    return this.sysBlock(blockTypes.Ticks);
  }

  get wifi(): WiFiSettingsBlock {
    return this.sysBlock(blockTypes.WiFiSettings);
  }

  get ready(): boolean {
    return isReady(this.serviceId);
  }

  get updating(): boolean {
    return sparkStore.updateSource(this.serviceId) !== null;
  }

  get sysDate(): string {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  fetchAll(): void {
    sparkStore.fetchAll(this.serviceId);
    sparkStore.fetchBlocks(this.serviceId);
  }

  retryUpdateSource(): void {
    sparkStore.fetchServiceStatus(this.serviceId);
    sparkStore.createUpdateSource(this.serviceId);
  }
}
</script>

<template>
  <CardWrapper v-if="ready" v-bind="{context}">
    <template #toolbar>
      <DialogToolbar v-if="inDialog">
        <q-item-section>
          <q-item-label>{{ serviceId }}</q-item-label>
          <q-item-label caption>
            Device info
          </q-item-label>
        </q-item-section>
        <template #buttons>
          <q-btn flat round icon="refresh" class="darkish" @click="fetchAll" />
        </template>
      </DialogToolbar>
      <Toolbar v-else :title="serviceId" subtitle="Device info">
        <template #buttons>
          <q-btn flat round icon="refresh" class="darkish" @click="fetchAll" />
        </template>
      </Toolbar>
    </template>


    <CardWarning v-if="!updating">
      <template #message>
        <span>Unable to update automatically</span>
      </template>
      <template #actions>
        <q-btn label="Retry" color="warning" outline @click="retryUpdateSource" />
      </template>
    </CardWarning>

    <q-card-section>
      <div class="row wrap q-gutter-x-md">
        <LabeledField label="Firmware version" :class="infoClass">
          {{ sysInfo.data.version }}
        </LabeledField>
        <LabeledField label="Firmware release date" :class="infoClass">
          {{ sysInfo.data.releaseDate }}
        </LabeledField>
        <LabeledField label="Device time" :class="infoClass">
          {{ sysDate }}
        </LabeledField>
        <LabeledField label="Time since boot" :class="infoClass">
          {{ ticks.data.millisSinceBoot | duration }}
        </LabeledField>
        <LabeledField label="Device ID" :class="infoClass" tag-style="word-wrap: break-word;">
          {{ sysInfo.data.deviceId }}
        </LabeledField>
        <LabeledField label="IP address" :class="infoClass">
          {{ wifi.data.ip }}
        </LabeledField>
      </div>
    </q-card-section>
  </CardWrapper>
</template>
