<script lang="ts">
import WidgetBase from '@/components/Widget/WidgetBase';
import Component from 'vue-class-component';
import featureStore from '@/store/features';
import sparkStore from '@/plugins/spark/store';
import { Link } from '@/helpers/units';
import { PidBlock } from '../Pid/types';
import PidDisplay from '../Pid/PidDisplay.vue';
import { typeName as setpointType } from '../SetpointSensorPair/getters';
import get from 'lodash/get';
import { Block } from '@/plugins/spark/types';

interface LinkDisplay {
  id: string;
  type: string;
  typeName: string;
}

@Component({
  components: {
    PidDisplay,
  },
})
export default class ControlLoopWidget extends WidgetBase {
  modalOpen: boolean = false;

  get serviceId() {
    return this.$props.config.serviceId;
  }

  get pidId() {
    return this.$props.config.pidId;
  }

  get pidBlock(): PidBlock | null {
    if (!this.pidId) {
      return null;
    }
    return sparkStore.blocks(this.serviceId)[this.pidId] || null;
  }

  set pidBlock(block: PidBlock | null) {
    if (block) {
      sparkStore.saveBlock([this.serviceId, block])
        .catch(() => this.$forceUpdate());
    }
  }

  asLinkDisplay(block: Block) {
    return {
      id: block.id,
      type: block.type,
      typeName: featureStore.displayNameById(block.type),
    };
  }

  findLinks(id: string | null): LinkDisplay[] {
    const block = sparkStore.blocks(this.serviceId)[id || ''];
    if (!id || !block) {
      return [];
    }

    const display = this.asLinkDisplay(block);
    const links: Link[] = Object.values(block.data)
      .filter(v => v instanceof Link) as Link[];

    return links
      .filter(link => !link.driven)
      .reduce((acc: LinkDisplay[], link: any) => ([...acc, ...this.findLinks(link.id)]), [display]);
  }

  get inputChain(): LinkDisplay[] {
    if (!this.pidBlock) {
      return [];
    }
    return this.findLinks(this.pidBlock.data.inputId.id).reverse();
  }

  get outputChain(): LinkDisplay[] {
    if (!this.pidBlock) {
      return [];
    }
    return this.findLinks(this.pidBlock.data.outputId.id);
  }

  get externalDrivers(): LinkDisplay[] {
    // Setpoints may be driven by something else (profile, setpoint driver, etc)
    // Just display the block that's actually driving, ignore any blocks driving the driver
    const setpoint = this.inputChain.find(display => display.type === setpointType);
    if (!setpoint) {
      return [];
    }

    return sparkStore.blockValues(this.serviceId)
      .filter(block => get(block, 'data.drivenTargetId.id') === setpoint.id)
      .map(this.asLinkDisplay);
  }

  get buttonProps() {
    return { icon: 'mdi-pencil', flat: true, class: 'q-py-xs q-px-sm' };
  }
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <q-dialog v-model="modalOpen" no-backdrop-dismiss>
      <ControlLoopForm
        v-if="modalOpen"
        v-bind="$props"
        :field="config"
        :on-change-field="saveConfig"
      />
    </q-dialog>

    <WidgetToolbar :title="widgetTitle" :subtitle="displayName">
      <q-item-section side>
        <q-btn-dropdown flat split icon="settings" @click="modalOpen = true">
          <q-list dark bordered>
            <ActionItem
              v-if="$props.onCopy"
              icon="file_copy"
              label="Copy widget"
              @click="$props.onCopy(widgetId)"
            />
            <ActionItem
              v-if="$props.onMove"
              icon="exit_to_app"
              label="Move widget"
              @click="$props.onMove(widgetId)"
            />
            <ActionItem
              v-if="$props.onDelete"
              icon="delete"
              label="Delete widget"
              @click="$props.onDelete(widgetId)"
            />
          </q-list>
        </q-btn-dropdown>
      </q-item-section>
    </WidgetToolbar>

    <q-card-section v-if="externalDrivers.length">
      <q-item v-for="(display, idx) in externalDrivers" :key="idx" dark>
        <q-item-section avatar>
          <q-icon name="mdi-car-cruise-control"/>
          <q-tooltip>Setpoint Driver</q-tooltip>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ display.id }}</q-item-label>
          <q-item-label caption>{{ display.typeName }}</q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <BlockFormButton :block-id="display.id" :service-id="serviceId" :btn-props="buttonProps"/>
        </q-item-section>
      </q-item>
      <q-separator dark inset/>
    </q-card-section>

    <q-card-section>
      <q-item v-if="inputChain.length === 0" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>No input blocks set</q-item-section>
      </q-item>
      <q-item v-for="(display, idx) in inputChain" :key="idx" dark>
        <q-item-section avatar>
          <q-icon name="mdi-gauge"/>
          <q-tooltip>Process</q-tooltip>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ display.id }}</q-item-label>
          <q-item-label caption>{{ display.typeName }}</q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <BlockFormButton :block-id="display.id" :service-id="serviceId" :btn-props="buttonProps"/>
        </q-item-section>
      </q-item>
      <q-separator dark inset/>
    </q-card-section>

    <q-card-section>
      <q-item dark dense>
        <q-item-section avatar>
          <q-icon name="mdi-calculator-variant"/>
          <q-tooltip>Control</q-tooltip>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ pidId }}</q-item-label>
          <q-item-label caption>PID</q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <BlockFormButton :block-id="pidId" :service-id="serviceId" :btn-props="buttonProps"/>
        </q-item-section>
      </q-item>
    </q-card-section>
    <PidDisplay v-if="pidBlock" v-model="pidBlock"/>

    <q-card-section>
      <q-separator dark inset/>
      <q-item v-if="outputChain.length === 0" dark>
        <q-item-section avatar>
          <q-icon name="warning"/>
        </q-item-section>
        <q-item-section>No output blocks set</q-item-section>
      </q-item>
      <q-item v-for="(display, idx) in outputChain" :key="idx" dark>
        <q-item-section avatar>
          <q-icon name="mdi-engine-outline"/>
          <q-tooltip>Output</q-tooltip>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ display.id }}</q-item-label>
          <q-item-label caption>{{ display.typeName }}</q-item-label>
        </q-item-section>
        <q-item-section class="col-auto">
          <BlockFormButton :block-id="display.id" :service-id="serviceId" :btn-props="buttonProps"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
