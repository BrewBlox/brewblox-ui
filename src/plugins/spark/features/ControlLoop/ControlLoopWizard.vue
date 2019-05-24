<script lang="ts">
import WidgetWizardBase from '@/components/Wizard/WidgetWizardBase';
import Component from 'vue-class-component';
import serviceStore, { Service } from '@/store/services';
import sparkStore from '@/plugins/spark/store';
import get from 'lodash/get';
import { PidBlock } from '../Pid/types';
import { ControlLoopConfig } from './types';
import { Watch } from 'vue-property-decorator';


@Component
export default class ControlLoopWizard extends WidgetWizardBase {
  service: Service | null = null;
  pid: PidBlock | null = null;

  get serviceId(): string {
    return get(this, ['service', 'id'], '');
  }

  get serviceOpts() {
    return serviceStore.serviceValues
      .filter(service => service.type === 'Spark')
      .map(service => ({
        label: service.title,
        value: service,
      }));
  }

  get pidOpts() {
    if (!this.service) {
      return [];
    }
    return sparkStore.blocksByType(this.serviceId, 'Pid')
      .map(block => ({
        label: block.id,
        value: block,
      }));
  }

  get ready() {
    return !!this.service && !!this.pid;
  }

  createWidget() {
    const service = this.service as Service;
    const pid = this.pid as PidBlock;

    const config: ControlLoopConfig = {
      serviceId: service.id,
      pidId: pid.id,
    };

    this.createItem({
      config,
      id: this.widgetId,
      title: this.widgetTitle,
      feature: this.typeId,
      dashboard: this.$props.dashboardId,
      order: 0,
      ...this.defaultWidgetSize,
    });
  }

  @Watch('service')
  updatePid(newService: Service) {
    if (!newService || (newService && this.pid && this.pid.serviceId !== newService.id)) {
      this.pid = null;
    }
  }

  mounted() {
    this.widgetTitle = this.typeDisplayName;
    if (this.serviceOpts.length > 0) {
      this.service = this.serviceOpts[0].value;
    }
  }
}
</script>

<template>
  <div>
    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-input v-model="widgetTitle" dark label="Widget name"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Service</q-item-label>
          <q-option-group v-model="service" :options="serviceOpts"/>
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>Pid</q-item-label>
          <q-option-group :disable="!service" v-model="pid" :options="pidOpts"/>
        </q-item-section>
      </q-item>
    </q-card-section>

    <q-card-actions class="row justify-between">
      <q-btn unelevated label="Back" @click="back"/>
      <q-btn :disable="!ready" unelevated label="Create" color="primary" @click="createWidget"/>
    </q-card-actions>
  </div>
</template>
