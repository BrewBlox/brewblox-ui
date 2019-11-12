<script lang="ts">
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import UrlSafeString from 'url-safe-string';
import { Component } from 'vue-property-decorator';

import { dashboardIdRules } from '@/helpers/dashboards';
import { suggestId, validator, valOrDefault } from '@/helpers/functional';
import { typeName as sparkType } from '@/plugins/spark/getters';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Service, serviceStore } from '@/store/services';

import WizardTaskBase from '../components/WizardTaskBase';
import { RimsBlockNames, RimsConfig } from './types';


@Component
export default class RimsNamingTask extends WizardTaskBase<RimsConfig> {
  chosenNames: Partial<RimsBlockNames> = {};
  idGenerator = new UrlSafeString();

  get defaultNames(): RimsBlockNames {
    return {
      kettleSensor: 'Kettle Sensor',
      kettleSetpoint: 'Kettle Setpoint',
      kettlePid: 'Kettle PID',
      tubeSensor: 'Tube Sensor',
      tubeDriver: 'Tube Setpoint Driver',
      tubeSetpoint: 'Tube Setpoint',
      tubePid: 'Tube PID',
      tubePwm: 'Tube PWM',
      tubeAct: 'Tube Actuator',
      pumpAct: 'Pump Actuator',
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
    return valOrDefault(this.config.prefix, 'RIMS');
  }

  set prefix(prefix: string) {
    this.updateConfig({ ...this.config, prefix });
  }

  get dashboardTitle(): string {
    return valOrDefault(this.config.dashboardTitle, 'RIMS');
  }

  set dashboardTitle(dashboardTitle: string) {
    this.updateConfig({ ...this.config, dashboardTitle });
  }

  get dashboardId(): string {
    return valOrDefault(
      this.config.dashboardId,
      suggestId(this.idGenerator.generate(this.dashboardTitle), validator(this.dashboardIdRules))
    );
  }

  set dashboardId(dashboardId: string) {
    this.updateConfig({ ...this.config, dashboardId });
  }

  get dashboardIdRules(): InputRule[] {
    return dashboardIdRules();
  }

  get names(): RimsBlockNames {
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
    this.$delete(this.config, key);
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
      dashboardId: new UrlSafeString().generate(this.dashboardTitle),
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
        <q-item dark class="text-weight-light">
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

    <q-separator dark />

    <q-card-actions>
      <q-btn unelevated label="Back" @click="back" />
      <q-space />
      <q-btn :disable="!valuesOk" unelevated label="Next" color="primary" @click="taskDone" />
    </q-card-actions>
  </div>
</template>
