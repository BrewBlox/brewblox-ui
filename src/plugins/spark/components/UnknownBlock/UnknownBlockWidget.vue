<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import { Block } from '@/plugins/spark/state';
import { fetchAll } from '@/plugins/spark/store/actions';
import { lastStatus } from '@/plugins/spark/store/getters';
import { serviceById } from '@/store/services/getters';

interface AbsenceReason {
  message: string;
  temporary: boolean;
}

@Component
export default class UnknownBlockWidget extends WidgetBase {
  modalOpen: boolean = false;

  get serviceId(): string {
    return this.$props.config.serviceId;
  }

  get blockId(): string {
    return this.$props.config.blockId;
  }

  get block(): Block {
    return {
      id: this.blockId,
      serviceId: this.serviceId,
      type: this.$props.type,
      groups: [],
      data: {},
    };
  }

  get reason(): AbsenceReason {
    const status = lastStatus(this.$store, this.serviceId);
    if (!status || !status.synchronized) {
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

  switchBlockId(blockId: string) {
    this.$props.onChangeConfig(this.$props.id, { ...this.$props.config, blockId });
  }

  fetchAll() {
    fetchAll(this.$store, serviceById(this.$store, this.serviceId));
  }
}

</script>

<template>
  <q-card dark class="column">
    <q-modal v-model="modalOpen" no-backdrop-dismiss>
      <UnknownBlockForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="() => {}"
        :on-change-block-id="() => {}"
        :on-switch-block-id="switchBlockId"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <div class="ellipsis">{{ widgetId }}</div>
      <span slot="right" class="vertical-middle on-left">{{ displayName }}</span>
      <q-btn slot="right" flat round dense icon="settings" @click="modalOpen = true"/>
      <q-btn
        slot="right"
        :disable="!reason.temporary"
        flat
        round
        dense
        icon="refresh"
        @click="fetchAll"
      />
    </q-card-title>
    <q-card-separator/>
    <div v-if="reason.temporary">
      <q-card-main>{{ reason.message }}</q-card-main>
      <q-card-main class="row justify-center">
        <q-spinner size="50px"/>
      </q-card-main>
    </div>
    <div v-else>
      <q-alert color="warning" icon="warning" error>{{ reason.message }}</q-alert>
    </div>
  </q-card>
</template>
