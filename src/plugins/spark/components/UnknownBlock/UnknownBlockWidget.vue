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
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <UnknownBlockForm
        v-if="modalOpen"
        v-bind="$props"
        :field="block"
        :on-change-field="() => {}"
        :on-change-block-id="() => {}"
        :on-switch-block-id="switchBlockId"
      />
    </q-dialog>

    <q-card-section class="q-pa-xs">
      <q-item dark>
        <q-item-section>
          <q-item-label class="ellipsis text-h6">{{ widgetId }}</q-item-label>
          <q-item-label caption class="ellipsis">{{ displayName }}</q-item-label>
        </q-item-section>
        <q-item-section class="dense" side>
          <q-btn flat round dense icon="settings" @click="modalOpen = true"/>
        </q-item-section>
        <q-item-section class="dense" side>
          <q-btn flat round dense :disable="!reason.temporary" icon="refresh" @click="fetchAll"/>
        </q-item-section>
      </q-item>
      <q-separator dark inset/>
    </q-card-section>

    <q-card-section>
      <q-item dark>
        <q-item-section v-if="reason.temporary" avatar>
          <q-spinner size="25px"/>
        </q-item-section>
        <q-item-section v-else avatar>
          <q-icon name="warning" color="negative"/>
        </q-item-section>
        <q-item-section>{{ reason.message }}</q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
