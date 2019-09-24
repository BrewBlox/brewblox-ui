<script lang="ts">
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
import UrlSafeString from 'url-safe-string';
import { Component } from 'vue-property-decorator';

import WizardTaskBase from '@/components/Wizard/WizardTaskBase';
import { suggestId, validator, valOrDefault } from '@/helpers/functional';
import { typeName as sparkType } from '@/plugins/spark/getters';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Service, serviceStore } from '@/store/services';

import { RimsBlockNames, RimsConfig } from './types';


@Component
export default class RimsNamingTask extends WizardTaskBase<RimsConfig> {
  chosenNames: Partial<RimsBlockNames> = {};

  get defaultNames(): RimsBlockNames {
    return {
      kettleSensor: 'Kettle Sensor',
      kettleSetpoint: 'Kettle Setpoint',
      kettlePid: 'Kettle PID',
      kettlePwm: 'Kettle PWM',
      kettleAct: 'Kettle Actuator',
      tubeDriver: 'Tube Setpoint Driver',
      tubeSensor: 'Tube Sensor',
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

  get title(): string {
    return valOrDefault(this.config.title, 'RIMS');
  }

  set title(title: string) {
    this.updateConfig({ ...this.config, title });
  }

  get prefix(): string {
    return valOrDefault(this.config.prefix, this.title.slice(0, 5));
  }

  set prefix(prefix: string) {
    this.updateConfig({ ...this.config, prefix });
  }

  get dashboardTitle(): string {
    return valOrDefault(this.config.dashboardTitle, `${this.title} Dashboard`);
  }

  set dashboardTitle(dashboardTitle: string) {
    this.updateConfig({ ...this.config, dashboardTitle });
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
      title: this.title,
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
              Name your blocks and dashboards
            </q-item-label>
            <p>
              Enter a name for your new process below. The prefix will be used to suggest names for your new blocks.
            </p>
          </q-item-section>
        </q-item>

        <CardWarning v-if="groupError">
          <template #message>
            {{ groupError }}
          </template>
        </CardWarning>

        <!-- Generic settings -->
        <q-expansion-item default-opened label="Settings" icon="settings" dense>
          <QuickStartServiceField v-model="serviceId" :services="services" />
          <QuickStartNameField
            v-model="title"
            label="Arrangement name"
            @clear="clearKey('title')"
          >
            <template #help>
              The full name of your arrangement.
              It will be used as the default dashboard title.
              <br />The default prefix is the short version of this.
            </template>
          </QuickStartNameField>
          <QuickStartNameField
            v-model="prefix"
            optional
            label="Prefix"
            @clear="clearKey('prefix')"
          >
            <template #help>
              By default all block names are prefixed.
              You can override this for individual blocks.
            </template>
          </QuickStartNameField>
          <QuickStartNameField
            v-model="dashboardTitle"
            label="Dashboard"
            @clear="clearKey('dashboardTitle')"
          >
            <template #help>
              The name for the new dashboard
            </template>
          </QuickStartNameField>
        </q-expansion-item>

        <!-- Block names -->
        <q-expansion-item label="Block names" icon="mdi-tag-multiple" dense>
          <QuickStartNameField
            v-for="(nVal, nKey) in names" :key="nKey"
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
