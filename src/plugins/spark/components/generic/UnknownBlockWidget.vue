<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';

interface AbsenceReason {
  message: string;
  temporary: boolean;
}

@Component
export default class UnknownBlockWidget extends WidgetBase {

  get serviceId(): string {
    return this.widget.config.serviceId;
  }

  public get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  get blockId(): string {
    return this.widget.config.blockId;
  }

  get block(): Block {
    return {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.widget.feature,
      groups: [],
      data: {},
    };
  }

  get reason(): AbsenceReason {
    return this.sparkModule.lastBlocks
      ? {
        message: `Block ${this.blockId} not found on service ${this.serviceId}`,
        temporary: false,
      }
      : {
        message: 'Waiting for service...',
        temporary: true,
      };
  }

  fetch(): void {
    this.sparkModule.fetchAll();
  }
}

</script>

<template>
  <q-card>
    <component :is="toolbarComponent" :crud="crud">
      <template #actions>
        <ActionItem
          :disable="!reason.temporary"
          icon="refresh"
          label="Refresh"
          @click="fetch"
        />
      </template>
    </component>

    <CardWarning color="negative">
      <template #message>
        <span>{{ reason.message }}</span>
      </template>
      <template v-if="reason.temporary" #actions>
        <q-spinner size="25px" />
      </template>
    </CardWarning>
  </q-card>
</template>
