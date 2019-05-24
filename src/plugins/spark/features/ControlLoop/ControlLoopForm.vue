<script lang="ts">
import Component from 'vue-class-component';
import FormBase from '@/components/Form/FormBase';
import serviceStore from '@/store/services';
import sparkStore from '@/plugins/spark/store';
import { ControlLoopConfig } from './types';

interface PeriodDisplay {
  start: boolean;
  duration: boolean;
  end: boolean;
}

@Component
export default class ControlLoopForm extends FormBase {
  get config(): ControlLoopConfig {
    return this.$props.field;
  }

  get serviceId(): string {
    return this.config.serviceId;
  }

  set serviceId(serviceId: string) {
    if (serviceId === this.config.serviceId) {
      return;
    }
    this.saveConfig({
      ...this.config,
      serviceId,
      pidId: null,
    });
  }

  get pidId(): string {
    return this.config.pidId;
  }

  set pidId(pidId: string) {
    this.saveConfig({
      ...this.config,
      pidId,
    });
  }

  get serviceOpts() {
    return serviceStore.serviceValues
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service.id,
      }));
  }

  get pidOpts() {
    return sparkStore.blocksByType(this.config.serviceId, 'Pid')
      .map(block => ({
        label: block.id,
        value: block.id,
      }));
  }

}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!$props.embedded" v-bind="$props"/>

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Service</q-item-label>
          <q-option-group v-model="serviceId" :options="serviceOpts"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Pid</q-item-label>
          <q-option-group :disable="!serviceId" v-model="pidId" :options="pidOpts"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
