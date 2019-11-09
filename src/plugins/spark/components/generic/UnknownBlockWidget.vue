<script lang="ts">
import { Component } from 'vue-property-decorator';

import WidgetBase from '@/components/WidgetBase';
import { sparkStore } from '@/plugins/spark/store';
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
    const status = sparkStore.lastStatus(this.serviceId);
    if (!status || !status.synchronize) {
      return {
        message: 'Waiting for service...',
        temporary: true,
      };
    }
    return {
      message: `Block ${this.blockId} not found on service ${this.serviceId}`,
      temporary: false,
    };
  }

  fetchAll(): void {
    sparkStore.fetchAll(this.serviceId);
  }
}

</script>

<template>
  <q-card dark :class="cardClass">
    <component :is="toolbarComponent" :crud="crud">
      <template #actions>
        <ActionItem
          :disable="!reason.temporary"
          icon="refresh"
          label="Refresh"
          @click="fetchAll"
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
