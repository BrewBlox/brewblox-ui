<script lang="ts">
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import UrlSafeString from 'url-safe-string';
import { Component } from 'vue-property-decorator';

import { dashboardIdRules } from '@/helpers/dashboards';
import { suggestId, validator } from '@/helpers/functional';
import { typeName as sparkType } from '@/plugins/spark/getters';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Service, serviceStore } from '@/store/services';

import WizardTaskBase from '../components/WizardTaskBase';
import { GlycolBlockNames, GlycolConfig } from './types';


@Component
export default class GlycolNamingTask extends WizardTaskBase<GlycolConfig> {
  chosenNames: Partial<GlycolBlockNames> = {};
  idGenerator = new UrlSafeString();

  get defaultNames(): GlycolBlockNames {
    return {
      beerSensor: 'Beer Sensor',
      beerSetpoint: 'Beer Setpoint',
      beerProfile: 'Beer Profile',
      coolPid: 'Cool PID',
      coolPwm: 'Cool PWM',
      coolAct: 'Cool Actuator',
      heatPid: 'Heat PID',
      heatPwm: 'Heat PWM',
      heatAct: 'Heat Actuator',
      glycolSensor: 'Glycol Sensor',
      glycolSetpoint: 'Glycol Setpoint',
      glycolPid: 'Glycol PID',
      glycolPwm: 'Glycol PWM',
      glycolAct: 'Glycol Actuator',
      mutex: 'Mutex',
    };
  }

  get services(): Service[] {
    return serviceStore.typedServices(sparkType);
  }

  get serviceId(): string {
    return this.config.serviceId || this.services[0].id;
  }

  set serviceId(serviceId: string) {
    this.updateConfig({ ...this.config, serviceId });
  }

  get groupError(): string | null {
    const [name, active] = get(sparkStore.groupState, [this.serviceId, 0], ['Unknown', false]);
    return active
      ? null
      : `Group '${name}' is disabled. Created blocks will be inactive.`;
  }

  get prefix(): string {
    return this.config.prefix ?? 'Ferment';
  }

  set prefix(prefix: string) {
    this.updateConfig({ ...this.config, prefix });
  }

  get dashboardTitle(): string {
    return this.config.dashboardTitle ?? 'Fermentation';
  }

  set dashboardTitle(id: string) {
    this.updateConfig({ ...this.config, dashboardTitle: id });
  }

  get dashboardId(): string {
    return this.config.dashboardId
      ?? suggestId(this.idGenerator.generate(this.dashboardTitle), validator(this.dashboardIdRules));
  }

  set dashboardId(dashboardId: string) {
    this.updateConfig({ ...this.config, dashboardId });
  }

  get dashboardIdRules(): InputRule[] {
    return dashboardIdRules();
  }

  get names(): GlycolBlockNames {
    return {
      ...mapValues(this.defaultNames,
        v => suggestId(`${this.prefix} ${v}`, validator(blockIdRules(this.serviceId)))),
      ...this.chosenNames,
    };
  }

  get nameRules(): InputRule[] {
    return [
      ...blockIdRules(this.serviceId),
      v => Object.values(this.names)
        .filter(n => n === v).length < 2 || "Name can't be a duplicate",
    ];
  }

  get valuesOk(): boolean {
    return [
      this.serviceId,
      this.dashboardTitle,
      validator(this.dashboardIdRules)(this.dashboardId),
      Object.values(this.names).every(validator(this.nameRules)),
    ]
      .every(Boolean);
  }

  updateName(key: string, val: string): void {
    this.$set(this.chosenNames, key, val.trim());
  }

  clearKey(key: string): void {
    delete this.config[key];
    this.updateConfig(this.config);
  }

  clearName(key: string): void {
    this.$delete(this.chosenNames, key);
  }

  taskDone(): void {
    this.updateConfig({
      ...this.config,
      serviceId: this.serviceId,
      prefix: this.prefix,
      dashboardId: this.dashboardId,
      dashboardTitle: this.dashboardTitle,
      names: this.names,
      widgets: [],
      createdBlocks: [],
      changedBlocks: [],
      renamedBlocks: {},
    });
    this.next();
  }
}
</script>

<template>
  <div>
    <q-card-section style="height: 60vh">
      <q-scroll-area>
        <q-item class="text-weight-light">
          <q-item-section>
            <q-item-label class="text-subtitle1">
              Name your new dashboard and blocks
            </q-item-label>
          </q-item-section>
        </q-item>

        <CardWarning v-if="groupError">
          <template #message>
            {{ groupError }}
          </template>
        </CardWarning>

        <!-- Generic settings -->
        <QuickStartServiceField v-model="serviceId" :services="services" />
        <QuickStartNameField
          v-model="dashboardTitle"
          label="Dashboard name"
          @clear="clearKey('dashboardTitle')"
        >
          <template #help>
            The name for the new dashboard.
          </template>
        </QuickStartNameField>
        <QuickStartNameField
          v-model="prefix"
          optional
          label="Prefix for names"
          @clear="clearKey('prefix')"
        >
          <template #help>
            By default all block names are prefixed.
            You can override this for individual blocks.
          </template>
        </QuickStartNameField>

        <!-- Block names -->
        <q-expansion-item label="Generated names" icon="mdi-tag-multiple" dense>
          <QuickStartNameField
            v-model="dashboardId"
            label="Dashboard ID"
            :rules="dashboardIdRules"
            @clear="clearKey('dashboardId')"
          >
            <template #help>
              The unique identifier for your dashboard.
              <br /> By default, this is an URL-safe version of the dashboard title.
            </template>
          </QuickStartNameField>
          <QuickStartNameField
            v-for="(nVal, nKey) in names"
            :key="nKey"
            :value="nVal"
            :label="defaultNames[nKey]"
            :rules="nameRules"
            @clear="clearName(nKey)"
            @input="v => updateName(nKey, v)"
          >
          </QuickStartNameField>
        </q-expansion-item>
      </q-scroll-area>
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
